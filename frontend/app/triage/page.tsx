'use client'
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InteractiveSpace from './components/InteractiveSpace';
import TriageHeader from '@/app/triage/components/TriageHeader';
import withAuth from '../utils/withAuth';

const Triage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TriageContent />
    </Suspense>
  );
}

function TriageContent() {
  const searchParams = useSearchParams();
  const doc_id = searchParams.get('doc_id');
  const status = searchParams.get('status');
  const historyParam = searchParams.get('history');

  // Parse history if it exists
  const history = historyParam ? JSON.parse(historyParam) : null;

  return (
    <main>
      <TriageHeader doc_id={doc_id} status={status} history={history} />
      <InteractiveSpace doc_id={doc_id} status={status} />
    </main>
  );
}


export default withAuth(Triage);
