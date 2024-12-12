export interface ShiftType {
  shiftId: string;
  shiftName: string;
  state: string;
  startTime: string;
  endTime: string;
  departmentId: string;
  roleId: string;
  roleName: string;
  roleColor: string;
}

export interface RoleType {
  roleId: string;
  roleName: string;
  roleColor: string;
  shifts: ShiftType[];
}

export interface DepartmentType {
  departmentId: string;
  departmentName: string;
  roles: RoleType[];
}
