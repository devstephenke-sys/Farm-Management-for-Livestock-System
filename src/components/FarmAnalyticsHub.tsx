'use client';

import React, { useMemo, useState } from 'react';
import SimpleBarChart from '@/components/charts/SimpleBarChart';
import SimplePieChart from '@/components/charts/SimplePieChart';
import SimpleLineChart from '@/components/charts/SimpleLineChart';
import {
  computeHerdKpis,
  computeMilkKpis,
  computeHealthKpis,
  computeBreedingKpis,
  countByField,
  countByAgeGroup,
  healthStatusBreakdown,
  monthlyCountsFromAnimals,
  dailyMilkSeries,
  topProducingCows,
  milkByBreed,
  diseaseOccurrence,
  medicationCostTrend,
  pregnancyRatePie,
  monthlyCalvingTrend,
  filterAnimals,
} from '@/lib/farmAnalytics';

type AnalyticsSection = 'herd' | 'milk' | 'health' | 'breeding';

interface FarmAnalyticsHubProps {
  animals: any[];
  scheduleEvents: any[];
}

export default function FarmAnalyticsHub({ animals, scheduleEvents }: FarmAnalyticsHubProps) {
  const [section, setSection] = useState<AnalyticsSection>('herd');
  const [breedFilter, setBreedFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [tagSearch, setTagSearch] = useState('');

  const breeds = useMemo(
    () => [...new Set(animals.map((a) => a.breed).filter(Boolean))],
    [animals]
  );

  const filtered = useMemo(
    () =>
      filterAnimals(animals, {
        breed: breedFilter,
        gender: genderFilter,
        ageGroup: ageFilter,
        healthStatus: healthFilter,
        tagSearch,
      }),
    [animals, breedFilter, genderFilter, ageFilter, healthFilter, tagSearch]
  );

  const herdKpis = computeHerdKpis(filtered);
  const milkKpis = computeMilkKpis(filtered);
  const healthKpis = computeHealthKpis(filtered, scheduleEvents);
  const breedingKpis = computeBreedingKpis(filtered);

  const sections: { id: AnalyticsSection; label: string }[] = [
    { id: 'herd', label: 'Herd Management' },
    { id: 'milk', label: 'Milk Production' },
    { id: 'health', label: 'Health' },
    { id: 'breeding', label: 'Breeding' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              section === s.id
                ? 'bg-primary text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select value={breedFilter} onChange={(e) => setBreedFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
          <option value="ALL">All Breeds</option>
          {breeds.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
          <option value="ALL">All Genders</option>
          <option value="FEMALE">Female</option>
          <option value="MALE">Male</option>
        </select>
        <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
          <option value="ALL">All Age Groups</option>
          {['Calves', 'Heifers', 'Young Bulls', 'Adult Cows', 'Adult Bulls', 'Senior'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50">
          <option value="ALL">All Health</option>
          <option value="HEALTHY">Healthy</option>
          <option value="SICK">Sick</option>
          <option value="PREGNANT">Pregnant</option>
        </select>
        <input
          type="search"
          placeholder="Search tag or name..."
          value={tagSearch}
          onChange={(e) => setTagSearch(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
        />
      </div>

      {section === 'herd' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Total', herdKpis.totalLivestock],
              ['Healthy', herdKpis.healthy],
              ['Sick', herdKpis.sick],
              ['Pregnant', herdKpis.pregnant],
              ['Calves', herdKpis.calves],
              ['Bulls', herdKpis.bulls],
              ['Milk Producers', herdKpis.milkProducers],
              ['Sold', herdKpis.sold],
              ['Purchased', herdKpis.purchased],
              ['Mortality %', `${herdKpis.mortalityRate}%`],
            ].map(([label, val]) => (
              <div key={String(label)} className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                <p className="text-xl font-black text-slate-800 mt-1">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimplePieChart data={countByField(filtered, 'breed')} title="Distribution by Breed" />
            <SimpleBarChart data={countByAgeGroup(filtered)} title="Animals by Age Group" />
            <SimplePieChart data={healthStatusBreakdown(filtered)} title="Health Status" />
            <SimpleLineChart data={monthlyCountsFromAnimals(filtered, 'births')} title="Monthly Births" />
            <SimpleLineChart data={monthlyCountsFromAnimals(filtered, 'deaths')} title="Monthly Deaths" color="#e76f51" />
            <SimpleLineChart
              data={monthlyCountsFromAnimals(filtered, 'sales')}
              title="Population Changes (Sales)"
              color="#457b9d"
            />
          </div>
        </>
      )}

      {section === 'milk' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Today (L)', milkKpis.today.toFixed(1)],
              ['This Week (L)', milkKpis.week.toFixed(1)],
              ['This Month (L)', milkKpis.month.toFixed(1)],
              ['Avg / Cow (L)', milkKpis.avgPerCow.toFixed(1)],
              ['Top Producer', milkKpis.topCow],
            ].map(([label, val]) => (
              <div key={String(label)} className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                <p className="text-sm font-black text-slate-800 mt-1 truncate">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <SimpleLineChart data={dailyMilkSeries(filtered)} title="Daily Milk Production" unit="Liters" />
            <SimpleBarChart data={dailyMilkSeries(filtered, 6)} title="Monthly Production Trend" unit="L" />
            <SimpleBarChart data={topProducingCows(filtered)} title="Top Producing Cows" horizontal unit="L" />
            <SimpleBarChart data={milkByBreed(filtered)} title="Breed vs Milk Yield" horizontal unit="L" />
          </div>
        </>
      )}

      {section === 'health' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Vaccinated', healthKpis.vaccinated],
              ['Due Vaccination', healthKpis.dueVaccination],
              ['Treated', healthKpis.treated],
              ['Sick', healthKpis.sick],
              ['Recovered', healthKpis.recovered],
              ['Deaths', healthKpis.deaths],
            ].map(([label, val]) => (
              <div key={String(label)} className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                <p className="text-xl font-black text-slate-800 mt-1">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimpleBarChart data={diseaseOccurrence(filtered)} title="Disease Occurrence" horizontal />
            <SimplePieChart data={healthStatusBreakdown(filtered)} title="Vaccination / Health Progress" />
            <SimpleLineChart data={medicationCostTrend(filtered)} title="Medication Cost Trend" unit="KES" color="#e76f51" />
          </div>
        </>
      )}

      {section === 'breeding' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              ['Pregnant', breedingKpis.pregnant],
              ['Expected Calving', breedingKpis.expectedCalving],
              ['Successful AI', breedingKpis.successful],
              ['Repeat Breeding', breedingKpis.repeat],
              ['Success Rate', `${breedingKpis.successRate}%`],
            ].map(([label, val]) => (
              <div key={String(label)} className="bg-white rounded-xl border border-slate-100 p-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                <p className="text-xl font-black text-slate-800 mt-1">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SimplePieChart data={pregnancyRatePie(filtered)} title="Pregnancy Rate" />
            <SimpleLineChart data={monthlyCalvingTrend(filtered)} title="Expected Calving Trend" />
            <SimpleBarChart data={countByField(filtered, 'breed')} title="Breed Distribution" horizontal />
          </div>
        </>
      )}
    </div>
  );
}
