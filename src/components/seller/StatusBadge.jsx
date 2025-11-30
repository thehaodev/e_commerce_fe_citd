import React from 'react';

const StatusBadge = ({ status, colors }) => {
  const { bg, text } = colors.status[status] || { bg: colors.gray200, text: colors.gray900 };

  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color: text }}>
      {status}
    </span>
  );
};

export default StatusBadge;
