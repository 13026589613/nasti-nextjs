interface DepartmentWorkRoleVo {
  id: string;
  departmentName: string;
  hppdTargetHour: number;
}

export interface WorkerRoleListRes {
  id: string;
  communityId: string;
  pbjJobId: string;
  code: string;
  name: string;
  color: string;
  isEnabled: boolean;
  departmentWorkRoleVos: DepartmentWorkRoleVo[];
}
