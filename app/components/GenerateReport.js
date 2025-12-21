'use client'
import jsPDF from "jspdf";
const getBase64FromUrl = async (url) => {
  try {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result);
    });
  } catch (error) {
    console.error("Error loading image:", url, error);
    return null;
  }
};

export const downloadReport = async (filename, images, metrics) => {
  const sacLogo = await getBase64FromUrl("/sac_isro_logo.png"); 
  const sihLogo = await getBase64FromUrl("/sih_logo.jpeg"); 
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const primaryColor = [24, 44, 78]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark Slate
  const lightGrey = [245, 245, 245];   // Light Grey 
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("Satellite Image Analysis Report", margin, 17);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, pageWidth - margin, 17, { align: "right" });
  let yOffset = 40;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Visual Comparison", margin, yOffset);
  yOffset += 10;

  const imageWidth = 80;
  const imageHeight = 60;
  const xSpacing = 10;
  const ySpacing = 15;
  const startX = (pageWidth - (imageWidth * 2 + xSpacing)) / 2;
  let currentY = yOffset;

  Object.entries(images).forEach(([key, imageUrl], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xPos = startX + col * (imageWidth + xSpacing);
    const yPos = currentY + row * (imageHeight + ySpacing);
    if (yPos + imageHeight > pageHeight - 30) {
      doc.addPage();
      currentY = 20; 
    }
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(xPos - 0.5, yPos - 0.5, imageWidth + 1, imageHeight + 1);
    if (imageUrl) {
      doc.addImage(imageUrl, "PNG", xPos, yPos, imageWidth, imageHeight);
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...secondaryColor);
    const label = key.replace(/-/g, " ").toUpperCase();
    doc.text(label, xPos + imageWidth / 2, yPos + imageHeight + 6, { align: "center" });
    if (index === Object.entries(images).length - 1) {
      yOffset = yPos + imageHeight + 25;
    }
  });
  if (yOffset + 60 > pageHeight) {
    doc.addPage();
    yOffset = 30;
  }
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Evaluation Metrics", margin, yOffset);
  yOffset += 10;
  const rowHeight = 12;
  const tableWidth = pageWidth - (margin * 2);
  const col1Width = 60; 
  const col2Width = 50; 
  doc.setFillColor(...primaryColor);
  doc.rect(margin, yOffset, tableWidth, rowHeight, "F"); 
  doc.setTextColor(255, 255, 255); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Metric", margin + 5, yOffset + 8);
  doc.text("Value", margin + col1Width + 5, yOffset + 8);
  doc.text("Interpretation", margin + col1Width + col2Width + 5, yOffset + 8);
  yOffset += rowHeight;
  const tableData = [
    { 
      name: "PSNR (Peak Signal-to-Noise)", 
      value: metrics.psnr, 
      status: parseFloat(metrics.psnr) > 35 ? "Excellent (>35dB)" : "Good" 
    },
    { 
      name: "SSIM (Structural Similarity)", 
      value: metrics.ssim, 
      status: parseFloat(metrics.ssim) > 0.85 ? "High Similarity" : "Average" 
    },
    { 
      name: "RMSE (Root Mean Square Error)", 
      value: metrics.rmse, 
      status: "Error Rate (Lower is better)" 
    }
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  tableData.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(...lightGrey);
      doc.rect(margin, yOffset, tableWidth, rowHeight, "F");
    }
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yOffset, tableWidth, rowHeight); 
    doc.line(margin + col1Width, yOffset, margin + col1Width, yOffset + rowHeight); 
    doc.line(margin + col1Width + col2Width, yOffset, margin + col1Width + col2Width, yOffset + rowHeight); 
    doc.text(row.name, margin + 5, yOffset + 8);
    doc.text(String(row.value), margin + col1Width + 5, yOffset + 8);
    doc.text(row.status, margin + col1Width + col2Width + 5, yOffset + 8);
    yOffset += rowHeight;
  });
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    const logoSize = 10;
    if (sacLogo) {
      doc.addImage(sacLogo, "PNG", margin, footerY - 2, logoSize, logoSize);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.text("SAC - ISRO", margin + logoSize + 5, footerY + 5);
    }
    const sihText = "SIH 2025";
    const sihTextWidth = doc.getTextWidth(sihText);
    const rightEdge = pageWidth - margin;
    if (sihLogo) {
      doc.addImage(sihLogo, "JPEG", rightEdge - logoSize, footerY - 2, logoSize, logoSize);
      doc.text(sihText, rightEdge - logoSize - 5 - sihTextWidth, footerY + 5);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, footerY + 5, { align: "center" });
  }
  doc.save(`Report_${filename || "analysis"}.pdf`);
};