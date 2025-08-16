import { serial, text, pgTable, timestamp, numeric, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums for PostgreSQL
export const languageCodeEnum = pgEnum('language_code', [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'nl', 'sv', 'da', 'no', 'fi'
]);

export const translationStatusEnum = pgEnum('translation_status', [
  'pending', 'processing', 'language_detection', 'transcribing', 'translating', 'dubbing', 'completed', 'failed'
]);

export const speakerGenderEnum = pgEnum('speaker_gender', ['male', 'female', 'unknown']);

// Videos table
export const videosTable = pgTable('videos', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(), // Generated filename for storage
  original_filename: text('original_filename').notNull(), // User's original filename
  file_path: text('file_path').notNull(), // Path to stored video file
  file_size: integer('file_size').notNull(), // File size in bytes
  duration: numeric('duration', { precision: 10, scale: 2 }).notNull(), // Duration in seconds
  mime_type: text('mime_type').notNull(), // Video MIME type
  uploaded_at: timestamp('uploaded_at').defaultNow().notNull(),
  user_id: text('user_id').notNull() // User identifier
});

// Translation jobs table
export const translationJobsTable = pgTable('translation_jobs', {
  id: serial('id').primaryKey(),
  video_id: integer('video_id').notNull().references(() => videosTable.id, { onDelete: 'cascade' }),
  original_language: languageCodeEnum('original_language'), // Detected language, nullable until detected
  target_language: languageCodeEnum('target_language').notNull(),
  status: translationStatusEnum('status').notNull().default('pending'),
  progress_percentage: integer('progress_percentage').notNull().default(0), // 0-100
  error_message: text('error_message'), // Error details if failed
  translated_audio_path: text('translated_audio_path'), // Path to generated dubbed audio
  created_at: timestamp('created_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at') // When job was completed
});

// Speakers table for speaker identification
export const speakersTable = pgTable('speakers', {
  id: serial('id').primaryKey(),
  translation_job_id: integer('translation_job_id').notNull().references(() => translationJobsTable.id, { onDelete: 'cascade' }),
  speaker_label: text('speaker_label').notNull(), // e.g., "Speaker_0", "Speaker_1"
  speaker_name: text('speaker_name'), // Optional human-readable name
  gender: speakerGenderEnum('gender').notNull().default('unknown'),
  total_speaking_time: numeric('total_speaking_time', { precision: 10, scale: 2 }).notNull(), // Total seconds
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Transcript segments table
export const transcriptSegmentsTable = pgTable('transcript_segments', {
  id: serial('id').primaryKey(),
  translation_job_id: integer('translation_job_id').notNull().references(() => translationJobsTable.id, { onDelete: 'cascade' }),
  speaker_id: integer('speaker_id').references(() => speakersTable.id, { onDelete: 'set null' }), // Nullable if no speaker identified
  start_time: numeric('start_time', { precision: 10, scale: 3 }).notNull(), // Start time in seconds with millisecond precision
  end_time: numeric('end_time', { precision: 10, scale: 3 }).notNull(), // End time in seconds
  original_text: text('original_text').notNull(), // Original transcribed text
  translated_text: text('translated_text'), // Translated text, nullable until translation is complete
  confidence_score: numeric('confidence_score', { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
  segment_order: integer('segment_order').notNull(), // Order within the transcript
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations for better query building
export const videosRelations = relations(videosTable, ({ many }) => ({
  translationJobs: many(translationJobsTable)
}));

export const translationJobsRelations = relations(translationJobsTable, ({ one, many }) => ({
  video: one(videosTable, {
    fields: [translationJobsTable.video_id],
    references: [videosTable.id]
  }),
  speakers: many(speakersTable),
  transcriptSegments: many(transcriptSegmentsTable)
}));

export const speakersRelations = relations(speakersTable, ({ one, many }) => ({
  translationJob: one(translationJobsTable, {
    fields: [speakersTable.translation_job_id],
    references: [translationJobsTable.id]
  }),
  transcriptSegments: many(transcriptSegmentsTable)
}));

export const transcriptSegmentsRelations = relations(transcriptSegmentsTable, ({ one }) => ({
  translationJob: one(translationJobsTable, {
    fields: [transcriptSegmentsTable.translation_job_id],
    references: [translationJobsTable.id]
  }),
  speaker: one(speakersTable, {
    fields: [transcriptSegmentsTable.speaker_id],
    references: [speakersTable.id]
  })
}));

// TypeScript types for the table schemas
export type Video = typeof videosTable.$inferSelect;
export type NewVideo = typeof videosTable.$inferInsert;

export type TranslationJob = typeof translationJobsTable.$inferSelect;
export type NewTranslationJob = typeof translationJobsTable.$inferInsert;

export type Speaker = typeof speakersTable.$inferSelect;
export type NewSpeaker = typeof speakersTable.$inferInsert;

export type TranscriptSegment = typeof transcriptSegmentsTable.$inferSelect;
export type NewTranscriptSegment = typeof transcriptSegmentsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  videos: videosTable,
  translationJobs: translationJobsTable,
  speakers: speakersTable,
  transcriptSegments: transcriptSegmentsTable
};