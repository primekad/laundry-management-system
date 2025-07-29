import { getServiceTypes } from "./actions";
import { ServiceTypesClient } from "./client";

export default async function ServiceTypesPage() {
  const serviceTypes = await getServiceTypes();

  return <ServiceTypesClient serviceTypes={serviceTypes} />;
}
