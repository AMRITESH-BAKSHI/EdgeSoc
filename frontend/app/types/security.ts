export type AttackType = 'brute_force' | 'ddos' | 'sql_injection';
export type IncidentStatus = 'investigating' | 'resolved' | 'pending';

export interface AlertItem {
  id: string;
  timestamp: string;
  attackType: AttackType;
  sourceIp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: IncidentStatus;
}

export interface AgentActivity {
  agentName: string;
  message: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  timestamp: string;
}