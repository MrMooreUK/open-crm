import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyForm } from "@/components/companies/company-form";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="New company" description="Add an account" />
      <Card>
        <CardContent className="pt-4">
          <CompanyForm />
        </CardContent>
      </Card>
    </div>
  );
}
