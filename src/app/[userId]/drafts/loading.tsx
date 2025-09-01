import { Skeleton } from '@mui/material';

export default function SavesLoading() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <Skeleton 
          variant="text" 
          width={200} 
          height={48} 
          sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
        />
      </div>

      <div className="max-w-2xl">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton 
                  variant="text" 
                  width="60%" 
                  height={32} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 1 }}
                />
                <Skeleton 
                  variant="text" 
                  width="80%" 
                  height={20} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }}
                />
                <Skeleton 
                  variant="text" 
                  width="40%" 
                  height={16} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="ml-4">
                <Skeleton 
                  variant="rectangular" 
                  width={60} 
                  height={32} 
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
