import { useState } from "react";

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  loading: boolean;
}

export function UsernameForm({
  onSubmit,
  loading,
}: Readonly<UsernameFormProps>) {
  const [username, setUsername] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim() && !loading) {
      onSubmit(username.trim());
    }
  };

  const isDisabled = loading || !username.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-col sm:flex-row flex-wrap gap-3"
    >
      <input
        type="text"
        id="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter chess.com username"
        disabled={loading}
        onFocus={() => setInputFocused(true)}
        onBlur={() => setInputFocused(false)}
        className={`py-3 px-4 text-base bg-[#1e1c1a] rounded-md flex-1 w-full text-[#bababa] outline-none transition-colors duration-200 border-2 ${
          inputFocused ? "border-green-400" : "border-[#3d3a37]"
        }`}
      />
      <button
        type="submit"
        disabled={isDisabled}
        className={`py-3 px-6 text-base font-semibold rounded-md transition-colors duration-200 
          ${
            isDisabled
              ? "bg-[#3d3a37] text-[#989795] cursor-not-allowed"
              : "bg-green-600 hover:bg-green-400 text-white cursor-pointer"
          }`}
      >
        {loading ? "Analyzing..." : "Find Blunders"}
      </button>
    </form>
  );
}
