export default function FloatingInput({
  type = "text",
  name,
  value,
  onChange,
  label,
  required = true,
}) {
  return (
    <div className="relative mb-5">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className="peer block w-full text-[18px] text-[#545454] font-bold rounded-lg border border-gray-300 bg-white shadow-sm px-2 py-3 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#26599F] focus:border-[#26599F] "
      />

      <label
        htmlFor={name}
        className="absolute left-2 px-1 text-gray-400 text-[18px] pointer-events-none transition-all duration-200
                   -top-[0.5rem] scale-75 origin-left
                   peer-placeholder-shown:top-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400 
                   peer-focus:-top-3 bg-white px-2 rounded-sm
                   peer-focus:scale-75 peer-focus:text-[#26599F]"
      >
        {label}
      </label>
    </div>
  );
}
