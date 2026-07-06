import { ApiError } from '../../utils/ApiError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { Customer, ICustomer } from './customer.model';

export const createCustomer = async (data: Partial<ICustomer>): Promise<ICustomer> => {
  return Customer.create(data);
};

export const getCustomers = async (queryParams: Record<string, unknown>) => {
  const qb = new QueryBuilder(Customer, queryParams).search(['name', 'phone', 'email']).sort();
  return qb.execute();
};

export const getCustomerById = async (id: string): Promise<ICustomer> => {
  const customer = await Customer.findById(id);
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const updateCustomer = async (
  id: string,
  updates: Partial<ICustomer>
): Promise<ICustomer> => {
  const customer = await Customer.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!customer) throw ApiError.notFound('Customer not found');
  return customer;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw ApiError.notFound('Customer not found');
};
