'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const PALETTE = ['#00C853', '#00A040', '#81C784', '#4CAF50', '#2E7D32', '#C5E1A5', '#A5D6A7'];

interface InvestmentSlice {
  name: string;
  value: number;
  percent?: number;
}

export function LocationBreakdown({ data }: { data: InvestmentSlice[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-surface-900 mb-4">
        Distribución por ubicación
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_entry, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => `USD ${value.toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProjectsBreakdown({ data }: { data: InvestmentSlice[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-surface-900 mb-4">
        Inversión por proyecto
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              stroke="#64748b"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => (v.length > 18 ? `${v.slice(0, 18)}…` : v)}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => `USD ${value.toLocaleString()}`}
            />
            <Bar dataKey="value" fill="#00C853" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PortfolioCharts({
  byLocation,
  byProject,
}: {
  byLocation: InvestmentSlice[];
  byProject: InvestmentSlice[];
}) {
  if (byLocation.length === 0 && byProject.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <LocationBreakdown data={byLocation} />
      <ProjectsBreakdown data={byProject} />
    </div>
  );
}
