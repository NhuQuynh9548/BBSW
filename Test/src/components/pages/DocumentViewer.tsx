import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, X, FileText, Loader2 } from 'lucide-react';

export const DocumentViewer: React.FC = () => {
    const [searchParams] = useSearchParams();
    const url = searchParams.get('url') || '';
    const name = searchParams.get('name') || 'Document';
    const type = searchParams.get('type') || '';

    // Detect if file is an image
    const imageExtensions = /\.(jpg|jpeg|jpe|jfif|jif|pjpeg|png|apng|bmp|dib|gif|webp|heic|heif|heicv|heics|heivs|tiff|tif|avif|jxl|svg|svgz|ico|cur|dng|cr2|cr3|nef|nrw|arw|srf|sr2|rw2|orf|raf|raw|psd|psb)$/i;
    const isImage = type.startsWith('image/') || imageExtensions.test(name);

    // Detect if file is a video
    const videoExtensions = /\.(mp4|m4v|mov|avi|mkv|webm|3gp|3g2|ogv|mpeg|mpg|wmv|flv|hevc|h264|h265|ts|mts|m2ts|mxf|vob|rm|rmvb|asf|divx|xvid|f4v|m2v|qt)$/i;
    const isVideo = type.startsWith('video/') || videoExtensions.test(name);

    const isPdf = type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');

    // For PDF: fetch as blob so browser PDF viewer can load embedded fonts without CORS issues
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    useEffect(() => {
        if (!isPdf || !url) return;
        setPdfLoading(true);
        setPdfError(null);

        const controller = new AbortController();
        fetch(url, { signal: controller.signal, credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.blob();
            })
            .then(blob => {
                // Force MIME type to application/pdf so browser's PDF viewer activates
                const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(pdfBlob);
                setPdfBlobUrl(blobUrl);
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    setPdfError('Không thể tải file PDF. Vui lòng tải xuống.');
                }
            })
            .finally(() => setPdfLoading(false));

        return () => {
            controller.abort();
        };
    }, [url, isPdf]);

    // Revoke blob URL when component unmounts or URL changes
    useEffect(() => {
        return () => {
            if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
        };
    }, [pdfBlobUrl]);

    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download error:', error);
            alert('Không thể tải xuống file');
        }
    };

    const handleClose = () => {
        window.close();
    };

    return (
        <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
            {/* Header */}
            <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-[#262626] border-b border-white/10 shadow-lg z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                    <h1 className="text-sm font-medium truncate" title={name}>
                        {name}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-blue-500/20 active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-semibold">Tải xuống</span>
                    </button>

                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        title="Đóng tab"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-auto flex items-start justify-center p-4 custom-scrollbar">
                {!url ? (
                    <div className="text-center w-full flex items-center justify-center" style={{ minHeight: '100%' }}>
                        <p className="text-gray-400">Không tìm thấy tài liệu.</p>
                    </div>
                ) : isImage ? (
                    <div className="w-full flex items-center justify-center" style={{ minHeight: '100%' }}>
                        <img
                            src={url}
                            alt={name}
                            className="max-w-full max-h-[calc(100vh-10rem)] object-contain shadow-2xl rounded-sm"
                            style={{ display: 'block' }}
                        />
                    </div>
                ) : isVideo ? (
                    <div className="w-full flex items-center justify-center" style={{ minHeight: '100%' }}>
                        <video
                            src={url}
                            controls
                            className="max-w-full max-h-[calc(100vh-5rem)] shadow-2xl rounded-sm bg-black"
                            style={{ display: 'block' }}
                        >
                            Trình duyệt không hỗ trợ phát video này. Vui lòng tải xuống.
                        </video>
                    </div>
                ) : isPdf ? (
                    <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '100%', height: 'calc(100vh - 4rem)' }}>
                        {pdfLoading ? (
                            <div className="flex flex-col items-center gap-4 text-gray-400">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                                <p className="text-sm">Đang tải file PDF...</p>
                            </div>
                        ) : pdfError ? (
                            <div className="flex flex-col items-center gap-6">
                                <FileText className="w-14 h-14 text-gray-500" />
                                <p className="text-sm text-gray-400">{pdfError}</p>
                                <button onClick={handleDownload} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all">
                                    Tải xuống
                                </button>
                            </div>
                        ) : pdfBlobUrl ? (
                            <iframe
                                src={pdfBlobUrl}
                                className="w-full border-0 bg-white shadow-2xl rounded-sm"
                                style={{ height: '100%' }}
                                title={name}
                            />
                        ) : null}
                    </div>
                ) : (
                    <div className="w-full flex items-center justify-center" style={{ minHeight: '100%' }}>
                        <div className="bg-[#262626] p-10 rounded-2xl flex flex-col items-center gap-6 shadow-2xl border border-white/5">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <FileText className="w-10 h-10 text-blue-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium mb-2">Định dạng không hỗ trợ xem trực tiếp</p>
                                <p className="text-sm text-gray-400">Vui lòng tải xuống để xem nội dung chi tiết.</p>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-600/20"
                            >
                                Tải xuống ngay
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};
