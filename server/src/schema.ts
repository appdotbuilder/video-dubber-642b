import { z } from 'zod';

// Enum schemas for language codes (ISO 639-1)
export const languageCodeSchema = z.enum([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'nl', 'sv', 'da', 'no', 'fi'
]);

// Enum schema for translation job status
export const translationStatusSchema = z.enum([
  'pending', 'processing', 'language_detection', 'transcribing', 'translating', 'dubbing', 'completed', 'failed'
]);

// Enum schema for speaker gender
export const speakerGenderSchema = z.enum(['male', 'female', 'unknown']);

// Video schema
export const videoSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_filename: z.string(),
  file_path: z.string(),
  file_size: z.number().int(),
  duration: z.number(), // Duration in seconds
  mime_type: z.string(),
  uploaded_at: z.coerce.date(),
  user_id: z.string() // User identifier
});

export type Video = z.infer<typeof videoSchema>;

// Translation job schema
export const translationJobSchema = z.object({
  id: z.number(),
  video_id: z.number(),
  original_language: languageCodeSchema.nullable(), // Detected language
  target_language: languageCodeSchema,
  status: translationStatusSchema,
  progress_percentage: z.number().int().min(0).max(100),
  error_message: z.string().nullable(),
  translated_audio_path: z.string().nullable(), // Path to dubbed audio file
  created_at: z.coerce.date(),
  completed_at: z.coerce.date().nullable()
});

export type TranslationJob = z.infer<typeof translationJobSchema>;

// Speaker schema for speaker identification
export const speakerSchema = z.object({
  id: z.number(),
  translation_job_id: z.number(),
  speaker_label: z.string(), // e.g., "Speaker_0", "Speaker_1"
  speaker_name: z.string().nullable(), // Optional human-readable name
  gender: speakerGenderSchema,
  total_speaking_time: z.number(), // Total seconds this speaker speaks
  created_at: z.coerce.date()
});

export type Speaker = z.infer<typeof speakerSchema>;

// Transcript segment schema
export const transcriptSegmentSchema = z.object({
  id: z.number(),
  translation_job_id: z.number(),
  speaker_id: z.number().nullable(), // Which speaker said this
  start_time: z.number(), // Start time in seconds
  end_time: z.number(), // End time in seconds
  original_text: z.string(),
  translated_text: z.string().nullable(),
  confidence_score: z.number().min(0).max(1), // Transcription confidence
  segment_order: z.number().int(), // Order within the transcript
  created_at: z.coerce.date()
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

// Input schemas for creating records

// Video upload input
export const uploadVideoInputSchema = z.object({
  filename: z.string(),
  original_filename: z.string(),
  file_path: z.string(),
  file_size: z.number().int().positive(),
  duration: z.number().positive(),
  mime_type: z.string(),
  user_id: z.string()
});

export type UploadVideoInput = z.infer<typeof uploadVideoInputSchema>;

// Translation job creation input
export const createTranslationJobInputSchema = z.object({
  video_id: z.number(),
  target_language: languageCodeSchema,
  user_id: z.string() // For authorization
});

export type CreateTranslationJobInput = z.infer<typeof createTranslationJobInputSchema>;

// Update translation job status input
export const updateTranslationJobStatusInputSchema = z.object({
  job_id: z.number(),
  status: translationStatusSchema,
  progress_percentage: z.number().int().min(0).max(100).optional(),
  error_message: z.string().nullable().optional(),
  original_language: languageCodeSchema.optional(),
  translated_audio_path: z.string().optional()
});

export type UpdateTranslationJobStatusInput = z.infer<typeof updateTranslationJobStatusInputSchema>;

// Speaker creation input
export const createSpeakerInputSchema = z.object({
  translation_job_id: z.number(),
  speaker_label: z.string(),
  speaker_name: z.string().nullable().optional(),
  gender: speakerGenderSchema,
  total_speaking_time: z.number().nonnegative()
});

export type CreateSpeakerInput = z.infer<typeof createSpeakerInputSchema>;

// Transcript segment creation input
export const createTranscriptSegmentInputSchema = z.object({
  translation_job_id: z.number(),
  speaker_id: z.number().nullable().optional(),
  start_time: z.number().nonnegative(),
  end_time: z.number().positive(),
  original_text: z.string(),
  translated_text: z.string().nullable().optional(),
  confidence_score: z.number().min(0).max(1),
  segment_order: z.number().int().nonnegative()
});

export type CreateTranscriptSegmentInput = z.infer<typeof createTranscriptSegmentInputSchema>;

// Query input schemas
export const getTranslationJobInputSchema = z.object({
  job_id: z.number(),
  user_id: z.string() // For authorization
});

export type GetTranslationJobInput = z.infer<typeof getTranslationJobInputSchema>;

export const getUserTranslationJobsInputSchema = z.object({
  user_id: z.string(),
  status: translationStatusSchema.optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetUserTranslationJobsInput = z.infer<typeof getUserTranslationJobsInputSchema>;

export const getTranscriptInputSchema = z.object({
  job_id: z.number(),
  user_id: z.string() // For authorization
});

export type GetTranscriptInput = z.infer<typeof getTranscriptInputSchema>;

// Response schemas for complex queries
export const transcriptWithSpeakersSchema = z.object({
  segments: z.array(transcriptSegmentSchema),
  speakers: z.array(speakerSchema)
});

export type TranscriptWithSpeakers = z.infer<typeof transcriptWithSpeakersSchema>;

export const translationJobWithDetailsSchema = z.object({
  job: translationJobSchema,
  video: videoSchema,
  speakers_count: z.number().int(),
  segments_count: z.number().int()
});

export type TranslationJobWithDetails = z.infer<typeof translationJobWithDetailsSchema>;