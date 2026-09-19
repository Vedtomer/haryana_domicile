import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Typography, Chip, Tooltip, IconButton, CircularProgress } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { InputField } from './FormInputs';
import { quickPhoneticHindi, transliterateToHindi } from '../Utils/transliterateHindi';

export default function BilingualInputField({
    label,
    name,
    value = '',
    onChange,
    error,
    required = true,
    multiline = false,
    rows = 1,
    formatMode = 'both', // 'both' | 'hindi' | 'english'
    syncNotice = null,
    onSyncClick = null,
    isCustomized = false,
    placeholder = '',
    sx = {},
}) {
    // Parse value into English and Hindi parts
    const parseValue = (val) => {
        if (!val) return { en: '', hi: '' };
        if (typeof val !== 'string') return { en: String(val), hi: '' };
        
        if (val.includes(' / ')) {
            const parts = val.split(' / ');
            return { en: parts[0] || '', hi: parts.slice(1).join(' / ') || '' };
        }
        if (/[\u0900-\u097F]/.test(val)) {
            return { en: '', hi: val };
        }
        return { en: val, hi: '' };
    };

    const initial = parseValue(value);
    const [enText, setEnText] = useState(initial.en);
    const [hiText, setHiText] = useState(initial.hi);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);
    const lastEmittedValue = useRef(value);

    // Sync state when external value changes (e.g. from parent auto-fill sync)
    useEffect(() => {
        if (value !== lastEmittedValue.current) {
            const parsed = parseValue(value);
            setEnText(parsed.en);
            setHiText(parsed.hi);
            lastEmittedValue.current = value;
        }
    }, [value]);

    const formatOutput = (en, hi, mode = formatMode) => {
        const cleanEn = (en || '').trim();
        const cleanHi = (hi || '').trim();

        if (mode === 'both') {
            if (cleanEn && cleanHi) return `${cleanEn} / ${cleanHi}`;
            return cleanEn || cleanHi;
        }
        if (mode === 'hindi') {
            return cleanHi || cleanEn;
        }
        if (mode === 'english') {
            return cleanEn || cleanHi;
        }
        return cleanEn && cleanHi ? `${cleanEn} / ${cleanHi}` : cleanEn || cleanHi;
    };

    const emitChange = (newEn, newHi, mode = formatMode) => {
        const combined = formatOutput(newEn, newHi, mode);
        lastEmittedValue.current = combined;
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: combined,
                },
            });
        }
    };

    // When formatMode changes, re-emit the formatted value
    useEffect(() => {
        if (enText || hiText) {
            emitChange(enText, hiText, formatMode);
        }
    }, [formatMode]);

    // When English text changes, auto-transliterate to Hindi
    const handleEnChange = (e) => {
        const newEn = e.target.value;
        setEnText(newEn);

        // Immediate optimistic preview if words match dictionary
        const quick = quickPhoneticHindi(newEn);
        let activeHi = hiText;
        if (!newEn.trim()) {
            activeHi = '';
            setHiText('');
        } else if (quick && quick !== newEn) {
            activeHi = quick;
            setHiText(quick);
        }

        emitChange(newEn, activeHi);

        // Debounced high-accuracy transliteration via API
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (newEn.trim()) {
            setLoading(true);
            debounceTimer.current = setTimeout(async () => {
                const apiHi = await transliterateToHindi(newEn);
                setLoading(false);
                if (apiHi) {
                    setHiText(apiHi);
                    emitChange(newEn, apiHi);
                }
            }, 300);
        } else {
            setLoading(false);
        }
    };

    // When user manually edits Hindi text
    const handleHiChange = (e) => {
        const newHi = e.target.value;
        setHiText(newHi);
        emitChange(enText, newHi);
    };

    // Re-trigger transliteration manually
    const handleManualTranslate = async () => {
        if (!enText.trim()) return;
        setLoading(true);
        const apiHi = await transliterateToHindi(enText);
        setLoading(false);
        if (apiHi) {
            setHiText(apiHi);
            emitChange(enText, apiHi);
        }
    };

    return (
        <Box sx={{ width: '100%', mb: 1, ...sx }}>
            {/* Header / Info Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="700" color="text.primary">
                        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                    </Typography>
                    {loading && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontSize: '0.75rem' }}>
                            <CircularProgress size={12} />
                            <span>Translating...</span>
                        </Box>
                    )}
                </Box>

                {/* Auto Sync Indicator or Button */}
                {syncNotice && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                            size="small"
                            variant={isCustomized ? 'outlined' : 'filled'}
                            color={isCustomized ? 'default' : 'info'}
                            label={syncNotice}
                            icon={isCustomized ? <SyncIcon sx={{ fontSize: '14px !important' }} /> : <CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={onSyncClick}
                            sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                cursor: onSyncClick ? 'pointer' : 'default',
                                fontWeight: 600,
                            }}
                        />
                        {onSyncClick && (
                            <Tooltip title="Reset & Re-sync from applicant">
                                <IconButton size="small" onClick={onSyncClick} sx={{ p: 0.2 }}>
                                    <SyncIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Box>

            {/* Inputs: English and Hindi */}
            <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <InputField
                        label={`${label} (English)`}
                        name={`${name}_en`}
                        value={enText}
                        onChange={handleEnChange}
                        placeholder={placeholder || 'Type in English...'}
                        required={required}
                        multiline={multiline}
                        rows={rows}
                        error={error}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <Tooltip title="Transliterate to Hindi">
                                        <IconButton size="small" onClick={handleManualTranslate} sx={{ p: 0.5 }}>
                                            <TranslateIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                                        </IconButton>
                                    </Tooltip>
                                ),
                            },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <InputField
                        label={`${label} (हिंदी में)`}
                        name={`${name}_hi`}
                        value={hiText}
                        onChange={handleHiChange}
                        placeholder="हिंदी में (Auto-fill या खुद लिखें)..."
                        required={false}
                        multiline={multiline}
                        rows={rows}
                    />
                </Grid>
            </Grid>

            {/* Live Result Preview */}
            <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <strong>Final Record / Print:</strong>
                    <span style={{ color: '#1e3a8a', fontWeight: 600, background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                        {formatOutput(enText, hiText) || '(Empty)'}
                    </span>
                </Typography>
            </Box>
        </Box>
    );
}
