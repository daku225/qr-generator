import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-3 shadow-sm transition-colors duration-150"
      />
    </div>
  );
};