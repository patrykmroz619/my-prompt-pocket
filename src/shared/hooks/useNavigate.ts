/**
 * Simple hook for client-side navigation
 */
export const useNavigate = () => {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  return { navigate };
};
