import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Print({ record }) {
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    const isDirectParam = typeof window !== 'undefined' && window.location.search.includes('direct=1');
    const isDirectMode = isInIframe || isDirectParam;

    const [allowSlipPrint, setAllowSlipPrint] = useState(isDirectMode);

    useEffect(() => {
        if (isDirectMode) {
            setAllowSlipPrint(true);
        }

        // Disable Right Click Context Menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        // Intercept keyboard shortcuts
        const handleKeyDown = (e) => {
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;

            // Block View Source (Ctrl+U), Save (Ctrl+S)
            if (isCtrlOrMeta && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Block Inspect Element (F12, Ctrl+Shift+I/C/J)
            if (e.key === 'F12' || (isCtrlOrMeta && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j'))) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            // Completely BLOCK Ctrl + P (Do not work at all)
            if (isCtrlOrMeta && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        const handleAfterPrint = () => {
            if (!isDirectMode) {
                setAllowSlipPrint(false);
            }
        };

        window.addEventListener('contextmenu', handleContextMenu, true);
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu, true);
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [isDirectMode]);

    const handlePrintClick = () => {
        setAllowSlipPrint(true);
        setTimeout(() => {
            window.print();
        }, 80);
    };

    return (
        <>
            <Head title={`Salary Slip - ${record.employee_name}`} />

            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 8mm 12mm 8mm 12mm;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .page-container {
                        box-shadow: none !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .black-screen-force {
                        display: block !important;
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        background-color: #000000 !important;
                        z-index: 999999 !important;
                    }
                }
                @media screen {
                    body {
                        background-color: #f1f5f9;
                    }
                }
            `}</style>

            {/* BLACK PAGE OVERLAY IF UNAUTHORIZED PRINT ATTEMPTED */}
            {!allowSlipPrint && (
                <div
                    className="black-screen-force"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#000000',
                        zIndex: 999999,
                    }}
                />
            )}

            {/* TOP ACTION BAR (HIDDEN IN PRINT & DIRECT IFRAME) */}
            {!isDirectMode && (
                <div className="no-print bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-50 shadow-md">
                    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/admin/salary-slip"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to List
                            </Link>
                            <span className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-md">
                                ⚡ Click <strong>Print Salary Slip</strong> below to print. Ctrl+P is completely disabled.
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrintClick}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Salary Slip (Online Printer)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN SALARY SLIP A4 CONTAINER */}
            <div className="py-6 no-print-padding">
                <div
                    className="page-container mx-auto bg-white text-black shadow-lg"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '8mm 12mm',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        fontSize: '11px',
                        lineHeight: '1.25',
                        color: '#000000',
                    }}
                >
                    {/* TITLE */}
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        &lt;&lt;&lt; SALARY SLIP &gt;&gt;&gt;
                    </div>

                    {/* TOP SECTION: EMPLOYER & EMPLOYEE DETAILS */}
                    <div style={{ border: '1.5px solid #000', marginBottom: '8px' }}>
                        {/* ROW 1: Names & Addresses */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                            {/* Left: Employer */}
                            <div style={{ width: '50%', padding: '4px 6px', borderRight: '1px solid #000', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', marginBottom: '2px' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>NAME OF EMPLOYER</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong style={{ textTransform: 'uppercase' }}>{record.employer_name}</strong>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>
                                        ADDRESS OF THE<br />EMPLOYER
                                    </span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong style={{ textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
                                        {record.employer_address}
                                    </strong>
                                </div>
                            </div>

                            {/* Right: Employee */}
                            <div style={{ width: '50%', padding: '4px 6px', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', marginBottom: '2px' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>NAME OF EMPLOYEE</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong style={{ textTransform: 'uppercase' }}>{record.employee_name}</strong>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>
                                        ADDRESS OF THE<br />EMPLOYEE
                                    </span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong style={{ textTransform: 'uppercase', whiteSpace: 'pre-line' }}>
                                        {record.employee_address}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Joining, Period, PAN, Aadhaar */}
                        <div style={{ display: 'flex' }}>
                            {/* Left */}
                            <div style={{ width: '50%', padding: '3px 6px', borderRight: '1px solid #000', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', marginBottom: '2px' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>JOINING FROM</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong>{record.joining_date}</strong>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>PERIOD</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong>{record.period}</strong>
                                </div>
                            </div>

                            {/* Right */}
                            <div style={{ width: '50%', padding: '3px 6px', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', marginBottom: '2px' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>PAN NO.</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong style={{ textTransform: 'uppercase' }}>{record.pan_no}</strong>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '150px', flexShrink: 0 }}>AADHAR NO.</span>
                                    <span style={{ margin: '0 4px' }}>:</span>
                                    <strong>{record.aadhar_no}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE TITLE BOX */}
                    <div
                        style={{
                            border: '1.5px solid #000',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            padding: '3px 0',
                            fontSize: '11px',
                            letterSpacing: '0.5px',
                            marginBottom: '6px',
                        }}
                    >
                        BASIC DETAILS OF PAY
                    </div>

                    {/* MAIN PAY BREAKDOWN TABLE */}
                    <div style={{ border: '1.5px solid #000', marginBottom: '8px', fontSize: '10px' }}>
                        {/* Table Header */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>
                            <div style={{ flex: 1 }}>Details of salary paid and other income and tax deducted</div>
                            <div style={{ width: '65px', textAlign: 'right' }}>INR</div>
                            <div style={{ width: '75px', textAlign: 'right' }}>INR</div>
                        </div>

                        <div style={{ padding: '4px 6px' }}>
                            {/* 1. Gross Salary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>1. Gross Salary</span>
                                <strong style={{ width: '75px', textAlign: 'right', fontSize: '10.5px' }}>{record.gross_salary}</strong>
                            </div>
                            <div style={{ paddingLeft: '14px' }}>(a) salary as per provisions contained in sec.17(1)</div>
                            <div style={{ paddingLeft: '14px' }}>(b) value of perquisites u/s 17(2)</div>
                            <div style={{ paddingLeft: '32px' }}>(as per form No 12BA, wherever applicable)</div>
                            <div style={{ paddingLeft: '14px' }}>(c) profif in lieu of salary u/s 17(3)</div>
                            <div style={{ paddingLeft: '32px' }}>(as per form No 12BA, wherever applicable)</div>
                            
                            {/* (d) Total */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span style={{ paddingLeft: '14px' }}>(d) Total</span>
                                <strong style={{ width: '75px', textAlign: 'right', fontSize: '10.5px' }}>{record.total_d}</strong>
                            </div>

                            {/* 2. Less; Allowance */}
                            <div style={{ marginTop: '5px' }}>2. Less; Allowance to extent exempt u/s 10</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>HRA Exemption</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.hra_exemption || '0.00'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>Leave Salary Exemption</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.leave_salary_exemption || '0.00'}</span>
                            </div>

                            {/* 3. Balance */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                <span>3. Balance (1-2)</span>
                                <span style={{ width: '75px', textAlign: 'right' }}>{record.balance_3 || '0.00'}</span>
                            </div>

                            {/* 4. Deduction */}
                            <div style={{ marginTop: '3px' }}>4. Deduction :</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>(a) Entertainment allowance</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.entertainment_allowance || '0.00'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>(b) Tex on employment</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.tax_on_employment || '0.00'}</span>
                            </div>

                            {/* 5. Aggregate */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                <span>5. Aggregate of 4(a) and 4(b)</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.aggregate_5 || '0.00'}</span>
                            </div>

                            {/* 6. Income chargeable */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>6. Income chargable under the head 'salary' (3-5)</span>
                                <span style={{ width: '75px', textAlign: 'right' }}>{record.income_salary_6 || '0.00'}</span>
                            </div>

                            {/* 7. Add: Any other income */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>7. Add: Any other income reported by the employee</span>
                                <span style={{ width: '75px', textAlign: 'right' }}>{record.other_income_7 || ''}</span>
                            </div>

                            {/* 8. Gross total Salary */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                <strong>8. Gross total Salary (6+7)</strong>
                                <strong style={{ width: '75px', textAlign: 'right', fontSize: '10.5px' }}>{record.gross_total_salary}</strong>
                            </div>

                            {/* 9. Deduction under chapter VI-A */}
                            <div style={{ marginTop: '4px' }}>9. Deduction under chapter VI-A</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>(A) Section 80C, 80CCC, and 80CCD</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.deduction_80c || '0.00'}</span>
                            </div>
                            <div style={{ paddingLeft: '24px' }}>a) Section 80C</div>
                            <div style={{ paddingLeft: '34px' }}>i) Employee Provident Fund</div>
                            <div style={{ paddingLeft: '44px' }}>Employee Voluntary Provident Fund</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '34px' }}>
                                <span>ii) Principal of home loan</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.home_loan_principal || '0.00'}</span>
                            </div>
                            <div style={{ paddingLeft: '24px' }}>b) section 80CCC</div>
                            <div style={{ paddingLeft: '24px' }}>c) section 80CCD</div>

                            {/* Note: 1 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                <span style={{ maxWidth: '420px', fontSize: '9.5px', color: '#111' }}>
                                    Note:1 Aggregate amount deductable under section 80C, 80CCC and 80CCD(1) shall not exceed 1.5 lakh rupees.
                                </span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.note_1_aggregate || '0.00'}</span>
                            </div>

                            {/* B) Other section */}
                            <div style={{ marginTop: '3px' }}>B) other section (e.g. 80E, 80G, 80TTA, etc.) under chapter VI-A.</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '14px' }}>
                                <span>a) 80C(01)</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.section_80c01 || '0.00'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '28px' }}>
                                <span>80D</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.section_80d || '0.00'}</span>
                            </div>

                            {/* 10. Aggregate */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                <span>10. Aggregate of deductiable amount under chapter VI-A</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.aggregate_deductible_10 || '0.00'}</span>
                            </div>

                            {/* 11. Total Income */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>11. Total Income (8-10)</span>
                                <div style={{ display: 'flex' }}>
                                    <span style={{ width: '65px', textAlign: 'right' }}>0.00</span>
                                    <strong style={{ width: '75px', textAlign: 'right', fontSize: '10.5px' }}>{record.total_income}</strong>
                                </div>
                            </div>

                            {/* 12. Tax on total income */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>12. Tax on total income</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.tax_on_total_income || '0.00'}</span>
                            </div>

                            {/* 13. Education cess */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>13. Education cess @ 3% (on tex computed at S.No 12)</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.education_cess || '0.00'}</span>
                            </div>

                            {/* 14. Tax payable */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>14. Tax payable (12+13)</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.tax_payable_14 || '0.00'}</span>
                            </div>

                            {/* 15. Relief */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                <span>15. Relief under section 89 (attach details)</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.relief_89 || '0.00'}</span>
                            </div>

                            {/* 16. Tax payable */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', paddingBottom: '2px' }}>
                                <span>16. Tax payable (14-15</span>
                                <span style={{ width: '65px', textAlign: 'right', marginRight: '75px' }}>{record.tax_payable_16 || '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* VERIFICATION BOX */}
                    <div style={{ border: '1.5px solid #000', padding: '5px 8px', marginBottom: '8px', fontSize: '10.5px' }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '4px' }}>
                            Verification
                        </div>
                        <div style={{ textAlign: 'justify', lineHeight: '1.35' }}>
                            I, <strong>{record.verification_name}</strong>, {record.verification_relation_title || 'wife/son/daughter of'} <strong>{record.verification_relation_name}</strong> working with us as <strong>{record.verification_designation}</strong> do hereby certify that the information given above is true, complete and correct and based on the books of account, documents, and other available records.
                        </div>
                    </div>

                    {/* SIGNATORY & PLACE BOX */}
                    <div style={{ border: '1.5px solid #000', display: 'flex', padding: '5px 8px', minHeight: '62px' }}>
                        {/* Place */}
                        <div style={{ width: '45%', display: 'flex', alignItems: 'flex-start' }}>
                            <span>Place :&nbsp;</span>
                            <strong style={{ textTransform: 'uppercase' }}>{record.signatory_place}</strong>
                        </div>

                        {/* Signatory */}
                        <div style={{ width: '55%', paddingLeft: '10px' }}>
                            <div style={{ fontSize: '10px', color: '#111', marginBottom: '4px' }}>
                                (Signature of person responsible for deduction tax)
                            </div>
                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                <span style={{ width: '90px' }}>Full Name</span>
                                <span>:&nbsp;</span>
                                <strong style={{ textTransform: 'uppercase' }}>{record.signatory_name}</strong>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span style={{ width: '90px' }}>Designation</span>
                                <span>:&nbsp;</span>
                                <strong style={{ textTransform: 'uppercase' }}>{record.signatory_designation}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
