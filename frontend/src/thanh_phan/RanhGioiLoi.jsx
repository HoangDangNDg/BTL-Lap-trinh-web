import React, { Component } from 'react';
import TrangBaoLoi from './TrangBaoLoi';

/**
 * Error Boundary bảo vệ toàn bộ ứng dụng khỏi lỗi sập giao diện (White Screen of Death)
 */
class RanhGioiLoi extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RanhGioiLoi đã bắt được lỗi giao diện:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <TrangBaoLoi
          fullPage={this.props.fullPage ?? true}
          loi={500}
          tieuDe="Giao diện gặp sự cố tạm thời"
          thongDiep="Đã xảy ra lỗi khi hiển thị dữ liệu trên màn hình này. Đừng lo lắng, dữ liệu của bạn không bị ảnh hưởng."
          loiKhuyen="Hãy bấm 'Thử tải lại' để khôi phục giao diện."
          onThuLai={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default RanhGioiLoi;


