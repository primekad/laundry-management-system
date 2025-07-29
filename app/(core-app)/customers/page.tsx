import { getCustomers } from "./actions";
import { CustomersClient } from "./client";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomersClient customers={customers} />;
}
