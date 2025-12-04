// Convert FastAPI style validation errors into a flat field map.
// Example input: { detail: [{ loc: ["body", "email"], msg: "Invalid email" }] }
// Output: { email: "Invalid email" }
const mapBackendErrors = (error) => {
  const detail = error?.response?.data?.detail;
  if (!Array.isArray(detail)) return {};

  return detail.reduce((acc, item) => {
    const loc = Array.isArray(item?.loc) ? item.loc : [];
    const field = loc[loc.length - 1];
    if (typeof field === "string" && item?.msg) {
      acc[field] = item.msg;
    }
    return acc;
  }, {});
};

export default mapBackendErrors;
