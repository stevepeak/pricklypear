import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Expenses() {
  const navigate = useNavigate();

  const handleFeatureRequest = () => {
    navigate('/feature-request?title=I need Expense Tracking');
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Expense Tracking (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Track and manage shared expenses with your co-parent, including
            child-related costs, household expenses, and other financial
            obligations. This feature will help you maintain transparency and
            accountability in your financial arrangements.
          </p>
          <p className="text-muted-foreground mb-6">
            You'll be able to categorize expenses, split costs automatically,
            generate reports, and keep a clear record of all shared financial
            transactions. Stay tuned for updates as we work on making this
            feature available!
          </p>
          <Button
            variant="accent"
            onClick={handleFeatureRequest}
            className="w-1/2"
          >
            Request This Feature
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
