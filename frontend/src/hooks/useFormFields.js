// src/hooks/useFormFields.js
import { useState } from "react";

const useFormFields = (initialState) => {
  const [fields, setFields] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFields = () => setFields(initialState);

  return [fields, handleChange, resetFields];
};

export default useFormFields;
