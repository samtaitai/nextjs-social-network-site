"use client";

import { useFormStatus } from "react-dom";

export default function FormSubmit() {
  // this hook provides status object
  const status = useFormStatus();

  // pending property is boolean
  if (status.pending) {
    return <p>Creating post...</p>
  }

  return (
    <>
      <button type="reset">Reset</button>
      <button>Create Post</button>
    </>
  );
}
