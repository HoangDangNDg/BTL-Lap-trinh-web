import React, { useState, useEffect } from 'react';

const ThanhChonId = ({
  label,
  fetchOptions,
  options: staticOptions,
  value,
  onChange,
  getOptionLabel = (item) => item.label || item.ten || item.name || item.id,
  getOptionValue = (item) => item.value !== undefined ? item.value : item.id || item.idDn || item.idCn || item.idKh || item.idLop || item.idHs || item.idGv || item.idBuoiHoc,
  placeholder = '-- Chọn --',
  allowAll = false,
  allLabel = 'Tất cả'
}) => {
  const [options, setOptions] = useState(staticOptions || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof fetchOptions === 'function') {
      setLoading(true);
      try {
        Promise.resolve(fetchOptions())
          .then((res) => {
            const items = Array.isArray(res) ? res : (res?.data || []);
            setOptions(items);
            if (items.length > 0 && !value && !allowAll) {
              const firstVal = getOptionValue(items[0]);
              if (onChange) onChange(firstVal, items[0]);
            }
          })
          .catch((err) => {
            console.error("Lỗi khi tải danh mục lựa chọn:", err);
            setOptions([]);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (err) {
        console.error("Lỗi thực thi fetchOptions:", err);
        setLoading(false);
      }
    } else if (staticOptions) {
      setOptions(staticOptions);
      if (staticOptions.length > 0 && !value && !allowAll) {
        const firstVal = getOptionValue(staticOptions[0]);
        if (onChange) onChange(firstVal, staticOptions[0]);
      }
    }
  }, [fetchOptions, staticOptions]);

  const handleChange = (e) => {
    const selectedVal = e.target.value;
    if (selectedVal === 'ALL') {
      if (onChange) onChange(null, null);
      return;
    }
    const numVal = isNaN(Number(selectedVal)) ? selectedVal : Number(selectedVal);
    const selectedItem = options.find((opt) => String(getOptionValue(opt)) === String(selectedVal));
    if (onChange) onChange(numVal, selectedItem);
  };

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      backgroundColor: 'var(--bg-surface)', 
      padding: '0.5rem 1rem', 
      borderRadius: 'var(--radius-md)', 
      border: '1px solid var(--border)',
      marginBottom: '1rem'
    }}>
      {label && (
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
          {label}:
        </span>
      )}
      <select
        value={value === null && allowAll ? 'ALL' : (value ?? '')}
        onChange={handleChange}
        disabled={loading}
        style={{
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-main)',
          fontSize: '0.875rem',
          outline: 'none',
          cursor: 'pointer',
          minWidth: '180px'
        }}
      >
        {allowAll && <option value="ALL">{allLabel}</option>}
        {!allowAll && !value && <option value="" disabled>{placeholder}</option>}
        {options.map((opt, idx) => {
          const val = getOptionValue(opt);
          const lbl = getOptionLabel(opt);
          return (
            <option key={val !== undefined ? val : idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {loading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang tải...</span>}
    </div>
  );
};

export default ThanhChonId;


