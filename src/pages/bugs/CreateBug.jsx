import { useState, useContext, useRef } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { LayoutContext } from "../../context/LayoutContext";
import api, { bugsAPI } from "../../services/api"; // Updated import to allow api.common
import "../../styles/createBug.css";
import { useNavigate } from "react-router-dom";
import BugSuccessModal from "../../components/bugs/BugSuccessModal";

const categories = [
  { value: "App Issue", label: "App Issue" },
  { value: "Billing Issue", label: "Billing Issue" },
  { value: "Game Issue", label: "Game Issue" },
  { value: "Food Order Issue", label: "Food Order Issue" },
  { value: "Table Issue", label: "Table Issue" },
  { value: "Other", label: "Other" },
];

const CreateBug = () => {
  const { isSidebarCollapsed } = useContext(LayoutContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("App Issue");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Image State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  // Handle Image Selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError("");
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };


  const handleSubmit = async () => {
    // Validate: Title OR Audio is required
    const hasAudio = !!audioBlob;
    const hasTitle = !!title.trim();
    
    if (!hasTitle && !hasAudio) {
      setError("Please describe the issue or record a voice note");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let uploadedImageUrl = null;
      let uploadedAudioUrl = null;

      // Upload Image
      if (selectedImage) {
        try {
          const res = await api.common.uploadFile(selectedImage);
          uploadedImageUrl = res.url;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          setError("Failed to upload image. Please try again or remove it.");
          setSubmitting(false);
          return; 
        }
      }

      // Upload Audio
      if (audioBlob) {
        try {
          // Convert blob to file
          const audioFile = new File([audioBlob], "voice_report.webm", { type: "audio/webm" });
          const res = await api.common.uploadFile(audioFile);
          uploadedAudioUrl = res.url;
        } catch (uploadErr) {
          console.error("Audio upload failed:", uploadErr);
          setError("Failed to upload voice recording. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      // If no title provided but audio exists, generate a default title
      const finalTitle = hasTitle ? title.trim() : `Voice Report - ${new Date().toLocaleString()}`;

      await bugsAPI.create({
        title: finalTitle,
        description: description.trim() || null,
        category,
        image_url: uploadedImageUrl,
        audio_url: uploadedAudioUrl,
      });

      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to submit bug:", err);
      setError(err.message || "Failed to submit bug report");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportAgain = () => {
    setTitle("");
    setDescription("");
    setCategory("App Issue");
    setSelectedImage(null);
    setImagePreview(null);
    clearRecording();
    setError("");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/report-bugs");
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className={`sidebar-spacer ${isSidebarCollapsed ? "collapsed" : ""}`} />

      <div className="dashboard-main">
        <Navbar />

        <div className="create-bug-page">
          <h5 onClick={() => navigate("/report-bugs")} style={{ cursor: "pointer" }}>
            ← Report a bug
          </h5>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Upload Image */}
          <input 
             type="file" 
             ref={fileInputRef} 
             style={{ display: "none" }} 
             accept="image/*"
             onChange={handleImageSelect}
          />
          <div className="upload-box" onClick={triggerFileSelect}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
            ) : (
              <div className="upload-placeholder">Upload table image</div>
            )}
          </div>
          {imagePreview && (
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setImagePreview(null); }}
                style={{ background: "#ff5252", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}
              >
                Remove Image
              </button>
            </div>
          )}

          {/* Dropdown */}
          <select
            className="bug-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Title */}
          <label>Title {audioUrl || isRecording ? "(Optional with recording)" : "*"}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={audioUrl || isRecording ? "Brief description (optional)" : "Brief description of the issue"}
            disabled={submitting}
          />

          {/* Description */}
          <label>Description of bug (optional)</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the bug..."
            disabled={submitting}
          />

          {/* Audio Section */}
          <div className="audio-section">
            <span style={{marginBottom: '10px', display: 'block', color: '#888'}}>Or</span>
            {audioUrl ? (
              <div className="audio-preview">
                 <p className="record-text">Voice Report Recorded ({formatTime(recordingTime)})</p>
                 <audio src={audioUrl} controls style={{ width: "100%", marginBottom: "10px" }} />
                 <button 
                   className="pause-btn" 
                   onClick={clearRecording}
                   style={{ width: "auto", padding: "8px 16px", background: "#ff5252", border: "none" }}
                 >
                   Delete Recording
                 </button>
              </div>
            ) : (
              <>
                <p className="record-text">
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Record the issue"}
                </p>
                <div 
                   className={`mic-circle ${isRecording ? "recording-active" : ""}`}
                   onClick={isRecording ? stopRecording : startRecording}
                   style={{ cursor: "pointer" }}
                >
                  <span style={{ fontSize: '24px' }}>
                    {isRecording ? "⏹" : "🎤"}
                  </span>
                </div>
                
                {isRecording ? (
                   <div className="recording-wave-container">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                   </div>
                ) : (
                   <div className="audio-wave">Click mic to start</div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="bug-actions">
            <button
              className="secondary"
              onClick={handleReportAgain}
              disabled={submitting}
            >
              Clear Form
            </button>
            <button
              className="primary"
              onClick={handleSubmit}
              disabled={submitting || (!title.trim() && !audioBlob)}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>

            {showSuccess && (
              <BugSuccessModal
                onClose={handleSuccessClose}
                onBack={() => navigate("/report-bugs")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBug;
