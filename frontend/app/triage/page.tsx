'use client'
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InteractiveSpace from './components/InteractiveSpace';
import TriageHeader from '@/app/triage/components/TriageHeader';
import withAuth from '../utils/withAuth';
import axiosInstance from '@/app/utils/axiosInstance';

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
  const username = searchParams.get('username');
  const edit = searchParams.get('edit') === 'false' ? false : true;

  // Parse history if it exists
  const history = historyParam ? JSON.parse(historyParam) : null;

  const handleNextClick = async () => {
    if (!doc_id) {
      console.error("Document ID is missing");
      return;
    }
    try {
      const response = await axiosInstance.get(`/get_next/${doc_id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const data = response.data;
      if (data.status === "success") {
        const annotation = data.annotation;
        if (annotation) {
          window.location.href = `/triage?doc_id=${annotation.id}&history=${JSON.stringify(annotation.history)}&status=${annotation.status}&username=${username}`;
        }
        else {
          alert("You are at the last document");
        }
      } else {
        alert(`Failed to get next document: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to send option:", error);
    }
  };

  const handlePrevClick = async () => {
    if (!doc_id) {
      console.error("Document ID is missing");
      return;
    }
    try {
      const response = await axiosInstance.get(`/get_prev/${doc_id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      const data = response.data;
      if (data.status === "success") {
        const annotation = data.annotation;
        if (annotation) {
          window.location.href = `/triage?doc_id=${annotation.id}&history=${JSON.stringify(annotation.history)}&status=${annotation.status}&username=${username}`;
        }
        else {
          alert("You are at the first document");
        }
      } else {
        alert(`Failed to get next document: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to send option:", error);
    }
  };

  return (
    <main>
      <TriageHeader doc_id={doc_id} history={history} handlePrevClick={handlePrevClick}
        handleNextClick={handleNextClick} isEdit={edit} />
      {doc_id && status ? (
        <InteractiveSpace doc_id={doc_id} status={status} handleNextClick={handleNextClick}
          isEdit={edit} />
      ) : (
        <div>Invalid document ID or status</div>
      )}
    </main>
  );
}

export default withAuth(Triage);
