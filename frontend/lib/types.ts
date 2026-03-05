export type Dumpster = {
  id: number;
  serial: string;
  color: string;
  isRented: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Rental = {
  id: number;
  dumpsterId: number;
  cep: string;
  street: string;
  district: string;
  city: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
};