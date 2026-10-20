import React, { useState, useEffect } from 'react';
import api from '../dich_vu/api';
import TrangBaoLoi from './TrangBaoLoi';
import './BangDuLieu.css';

const BangDuLieu = ({ title, apiUrl, apiFunction, columns, dataKey = 'data' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let responseData;
      
      if (apiFunction) {
        // If an API function is provided (from our generated services), use it
        const res = await apiFunction();
        // Generated services usually return response.data directly due to interceptors
        // or we handle ApiResponse structure
        responseData = res?.data !== undefined ? res.data : res; 
        if (responseData && responseData[dataKey]) {
            responseData = responseData[dataKey];
        }
      } else if (apiUrl) {
        // Fallback to direct URL string
        const response = await api.get(apiUrl);
        responseData = response.data[dataKey] || response.data;
      } else {
        throw new Error("No API source provided");
      }
      
      if (responseData == null) {
        setData([]);
      } else if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        setData([responseData]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl || apiFunction) {
      fetchData();
    }
  }, [apiUrl, apiFunction, dataKey]);

  return (
    <div className="datatable-container glass-panel animate-fade-in">
      <div className="datatable-header flex justify-between items-center">
        <h2>{title}</h2>
        <div className="datatable-actions">
          <button className="btn btn-primary btn-sm" onClick={fetchData}>
            Tải lại
          </button>
        </div>
      </div>

      <div className="datatable-content">
        {loading ? (
          <div className="datatable-loading flex flex-col items-center justify-center gap-4">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem 0' }}>
            <TrangBaoLoi loi={error} onThuLai={fetchData} />
          </div>
        ) : data.length === 0 ? (
          <div className="datatable-empty flex items-center justify-center">
            <p>Không có dữ liệu.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} style={{ width: col.width || 'auto' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, rowIndex) => (
                  <tr key={item.id || rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex}>
                        {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BangDuLieu;



