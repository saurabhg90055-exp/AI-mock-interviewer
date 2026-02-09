import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FileDown, FileText, Loader2, CheckCircle, 
    Calendar, BarChart3, MessageSquare, Award 
} from 'lucide-react';
import './ExportReport.css';

const ExportReport = ({ 
    interviewData = {},
    userData = {},
    onExport 
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);
    const [selectedSections, setSelectedSections] = useState({
        summary: true,
        questions: true,
        analytics: true,
        recommendations: true
    });
    
    const sections = [
        { id: 'summary', label: 'Interview Summary', icon: FileText },
        { id: 'questions', label: 'Questions & Answers', icon: MessageSquare },
        { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
        { id: 'recommendations', label: 'AI Recommendations', icon: Award }
    ];
    
    const toggleSection = (sectionId) => {
        setSelectedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        
        try {
            // Simulate export process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate PDF content (in real implementation, use jsPDF or similar)
            const reportData = {
                sections: selectedSections,
                interviewData,
                userData,
                generatedAt: new Date().toISOString()
            };
            
            onExport?.(reportData);
            setExportComplete(true);
            
            setTimeout(() => {
                setExportComplete(false);
            }, 3000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };
    
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    
    return (
        <div className="export-report">
            <div className="export-header">
                <FileDown size={20} />
                <h3>Export Report</h3>
            </div>
            
            <p className="export-desc">
                Generate a PDF report of your interview performance to share with coaches or for your records.
            </p>
            
            <div className="section-selector">
                <span className="selector-label">Include in report:</span>
                {sections.map(section => {
                    const Icon = section.icon;
                    const isSelected = selectedSections[section.id];
                    
                    return (
                        <motion.button
                            key={section.id}
                            className={`section-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleSection(section.id)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={16} />
                            <span>{section.label}</span>
                            {isSelected && <CheckCircle size={14} className="check-icon" />}
                        </motion.button>
                    );
                })}
            </div>
            
            <div className="export-preview">
                <div className="preview-header">
                    <span>Report Preview</span>
                    <span className="page-count">~{selectedCount + 1} pages</span>
                </div>
                <div className="preview-content">
                    <div className="preview-page">
                        <div className="preview-title">Interview Performance Report</div>
                        <div className="preview-meta">
                            <Calendar size={10} />
                            <span>Generated {new Date().toLocaleDateString()}</span>
                        </div>
                        {Object.entries(selectedSections)
                            .filter(([_, selected]) => selected)
                            .map(([sectionId]) => (
                                <div key={sectionId} className="preview-section">
                                    <div className="section-line" />
                                    <div className="section-line short" />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            
            <motion.button
                className={`export-btn ${exportComplete ? 'complete' : ''}`}
                onClick={handleExport}
                disabled={isExporting || selectedCount === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isExporting ? (
                    <>
                        <Loader2 size={18} className="spin" />
                        Generating PDF...
                    </>
                ) : exportComplete ? (
                    <>
                        <CheckCircle size={18} />
                        Report Downloaded!
                    </>
                ) : (
                    <>
                        <FileDown size={18} />
                        Export as PDF
                    </>
                )}
            </motion.button>
        </div>
    );
};

export default ExportReport;
