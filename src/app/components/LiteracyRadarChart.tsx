import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Text
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DimensionScore {
  dimension: string;
  score: number;
}

interface RadarChartProps {
  data: DimensionScore[];
}

export function LiteracyRadarChart({ data }: RadarChartProps) {
  // Simple check to ensure we don't render empty charts
  if (!data || data.length === 0) return null;

  return (
    <Card className="w-full bg-white border-2 border-blue-100 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-slate-800 text-center">
          Privacy Literacy Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={({ x, y, payload, ...rest }) => (
                  <Text
                    {...rest}
                    verticalAnchor="middle"
                    y={y}
                    x={x}
                    width={80} // Wraps long labels like "Data Protection Skills"
                    style={{ fill: '#64748b', fontSize: '12px', fontWeight: '500' }}
                  >
                    {payload.value}
                  </Text>
                )}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={false} 
                axisLine={false} 
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          {data.map((item) => (
            <div key={item.dimension} className="p-2 rounded bg-slate-50">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                {item.dimension}
              </p>
              <p className="text-lg font-bold text-blue-600">{item.score}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}