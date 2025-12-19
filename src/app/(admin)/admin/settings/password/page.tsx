'use client';

import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validation mật khẩu
    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error khi user bắt đầu nhập
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }

        // Validate real-time cho mật khẩu mới
        if (field === 'newPassword' && value) {
            if (!validatePassword(value)) {
                setErrors((prev) => ({
                    ...prev,
                    newPassword: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
                }));
            }
        }

        // Validate confirm password
        if (field === 'confirmPassword' && value) {
            if (value !== formData.newPassword) {
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword: 'Mật khẩu xác nhận không khớp',
                }));
            }
        }

        // Validate confirm password khi new password thay đổi
        if (field === 'newPassword' && formData.confirmPassword) {
            if (value !== formData.confirmPassword) {
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword: 'Mật khẩu xác nhận không khớp',
                }));
            } else {
                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (!validatePassword(formData.newPassword)) {
            newErrors.newPassword =
                'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await axios.put('/api/admin/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            toast.success('Thay đổi mật khẩu thành công!');

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setErrors({});
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
                'Có lỗi xảy ra khi thay đổi mật khẩu';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Thay đổi mật khẩu
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Mật khẩu hiện tại */}
                            <TextField
                                fullWidth
                                label="Mật khẩu hiện tại"
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Mật khẩu mới */}
                            <TextField
                                fullWidth
                                label="Mật khẩu mới"
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Xác nhận mật khẩu mới */}
                            <TextField
                                fullWidth
                                label="Xác nhận mật khẩu mới"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Submit button */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 2, bgcolor: 'var(--primary-color)' }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Thay đổi mật khẩu'
                                )}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
}
