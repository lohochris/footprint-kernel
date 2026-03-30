// FIX: Change 'react-router' to 'react-router-dom'
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* 2026 UI Standard: Keep the toaster visible but unobtrusive */}
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        closeButton 
      />
    </>
  );
}