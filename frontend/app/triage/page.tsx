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
  const status = searchParams.get('status')

  return (
    <main className=''>
      <TriageHeader doc_id={doc_id} status={status}/>
      <InteractiveSpace doc_id={doc_id} status={status}/>
    </main>
  );
}

export default withAuth(Triage);
