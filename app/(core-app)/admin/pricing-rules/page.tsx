import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PricingRulesClient } from "./client";
import { getPricingRules } from "./actions";
import { getLaundryCategories } from "../laundry-categories/actions";
import { getServiceTypes } from "../service-types/actions";

export default async function PricingRulesPage() {
  const pricingRules = await getPricingRules();
  const laundryCategories = await getLaundryCategories();
  const serviceTypes = await getServiceTypes();

  return (
    <div className="space-y-6">
    <PricingRulesClient
      pricingRules={pricingRules}
      laundryCategories={laundryCategories}
      serviceTypes={serviceTypes}
    />
    </div>
  );
}
