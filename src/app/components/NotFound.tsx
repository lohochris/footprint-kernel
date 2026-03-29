import { Link } from 'react-router';
import { AlertCircle, Home, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-gray-100 p-6">
              <AlertCircle className="h-16 w-16 text-gray-400" />
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link to="/audit">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Start Audit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
