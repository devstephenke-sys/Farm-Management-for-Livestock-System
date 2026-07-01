import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'VET') {
      return NextResponse.json({ error: 'Unauthorized. Only veterinarians can submit reports.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      appointmentId,
      animalId,
      temperature,
      weight,
      heartRate,
      respiratoryRate,
      symptoms, // Array of strings
      diagnosis,
      treatmentGiven,
      medicationName,
      medicationDosage,
      medicationDuration,
      recommendations,
      followUpDate,
    } = body;

    if (!animalId || !temperature || !weight || !heartRate || !respiratoryRate || !symptoms || !diagnosis || !treatmentGiven) {
      return NextResponse.json({ error: 'Missing required clinical examination fields' }, { status: 400 });
    }

    const targetAnimalId = parseInt(animalId);
    const animal = await prisma.animal.findUnique({
      where: { id: targetAnimalId },
      include: { farm: true },
    });

    if (!animal) {
      return NextResponse.json({ error: 'Animal not found' }, { status: 404 });
    }

    const symptomsStr = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

    // Use a transaction to perform all related updates in one atomic block
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create VetReport
      const report = await tx.vetReport.create({
        data: {
          appointmentId: appointmentId ? parseInt(appointmentId) : null,
          veterinarianId: user.id,
          animalId: targetAnimalId,
          temperature: parseFloat(temperature),
          weight: parseFloat(weight),
          heartRate: parseFloat(heartRate),
          respiratoryRate: parseFloat(respiratoryRate),
          symptoms: symptomsStr,
          diagnosis,
          treatmentGiven,
          medicationName: medicationName || null,
          medicationDosage: medicationDosage || null,
          medicationDuration: medicationDuration || null,
          recommendations: recommendations || null,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      // 2. Automatically update animal's weight and add clinical history log
      await tx.animal.update({
        where: { id: targetAnimalId },
        data: { weight: parseFloat(weight) },
      });

      // 3. Append to animal history
      const healthRecordNotes = `Diagnosed: ${diagnosis}. Symptoms exhibited: ${symptomsStr}. Clinic stats: Temp: ${temperature}°C, HR: ${heartRate}bpm, RR: ${respiratoryRate}/min. Treatment: ${treatmentGiven}. Recs: ${recommendations || 'None'}.`;
      await tx.healthRecord.create({
        data: {
          animalId: targetAnimalId,
          type: 'VET_VISIT',
          title: `Clinical Assessment: ${diagnosis}`,
          notes: healthRecordNotes,
          cost: 1500.0, // Standard consulting fee
          veterinarianId: user.id,
          reportId: report.id,
        },
      });

      // 4. Update appointment if linked
      if (appointmentId) {
        await tx.appointment.update({
          where: { id: parseInt(appointmentId) },
          data: { status: 'COMPLETED' },
        });
      }

      // 5. Send notification to the Farmer
      await tx.notification.create({
        data: {
          userId: animal.farm.farmerId,
          title: 'Veterinarian Assessment Filed',
          message: `Dr. ${user.name} has submitted a clinical report for ${animal.name} (${animal.tagNumber}).`,
          type: 'APPOINTMENT',
          animalId: animal.id,
        },
      });

      return report;
    });

    return NextResponse.json({ success: true, report: result });
  } catch (error) {
    console.error('Error submitting vet report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
