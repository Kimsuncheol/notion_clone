import { Skeleton } from '@mui/material';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" id="profile-page-loading">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Skeleton variant="circular" width={120} height={120} />
            <div className="flex-1 text-center md:text-left">
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={300} height={20} sx={{ mt: 1 }} />
              <div className="flex justify-center md:justify-start gap-4 mt-4">
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Skeleton variant="rectangular" width="100%" height={300} />
          </div>
          <div className="md:col-span-3">
            <Skeleton variant="rectangular" width="100%" height={400} />
          </div>
        </div>
      </div>
    </div>
  );
}