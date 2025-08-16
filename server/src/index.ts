import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types for validation
import { z } from 'zod';
import { 
  uploadVideoInputSchema,
  createTranslationJobInputSchema,
  updateTranslationJobStatusInputSchema,
  getTranslationJobInputSchema,
  getUserTranslationJobsInputSchema,
  getTranscriptInputSchema,
  createSpeakerInputSchema,
  createTranscriptSegmentInputSchema
} from './schema';

// Import handlers
import { uploadVideo } from './handlers/upload_video';
import { createTranslationJob } from './handlers/create_translation_job';
import { updateTranslationJobStatus } from './handlers/update_translation_job_status';
import { getTranslationJob } from './handlers/get_translation_job';
import { getUserTranslationJobs } from './handlers/get_user_translation_jobs';
import { createSpeaker } from './handlers/create_speaker';
import { createTranscriptSegment } from './handlers/create_transcript_segment';
import { getTranscript } from './handlers/get_transcript';
import { getVideo } from './handlers/get_video';
import { deleteVideo } from './handlers/delete_video';
import { processTranslationPipeline } from './handlers/process_translation_pipeline';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Video management endpoints
  uploadVideo: publicProcedure
    .input(uploadVideoInputSchema)
    .mutation(({ input }) => uploadVideo(input)),

  getVideo: publicProcedure
    .input(z.object({ videoId: z.number(), userId: z.string() }))
    .query(({ input }) => getVideo(input.videoId, input.userId)),

  deleteVideo: publicProcedure
    .input(z.object({ videoId: z.number(), userId: z.string() }))
    .mutation(({ input }) => deleteVideo(input.videoId, input.userId)),

  // Translation job management endpoints
  createTranslationJob: publicProcedure
    .input(createTranslationJobInputSchema)
    .mutation(({ input }) => createTranslationJob(input)),

  updateTranslationJobStatus: publicProcedure
    .input(updateTranslationJobStatusInputSchema)
    .mutation(({ input }) => updateTranslationJobStatus(input)),

  getTranslationJob: publicProcedure
    .input(getTranslationJobInputSchema)
    .query(({ input }) => getTranslationJob(input)),

  getUserTranslationJobs: publicProcedure
    .input(getUserTranslationJobsInputSchema)
    .query(({ input }) => getUserTranslationJobs(input)),

  // Processing pipeline endpoint
  processTranslationPipeline: publicProcedure
    .input(z.object({ jobId: z.number() }))
    .mutation(({ input }) => processTranslationPipeline(input.jobId)),

  // Speaker management endpoints
  createSpeaker: publicProcedure
    .input(createSpeakerInputSchema)
    .mutation(({ input }) => createSpeaker(input)),

  // Transcript management endpoints
  createTranscriptSegment: publicProcedure
    .input(createTranscriptSegmentInputSchema)
    .mutation(({ input }) => createTranscriptSegment(input)),

  getTranscript: publicProcedure
    .input(getTranscriptInputSchema)
    .query(({ input }) => getTranscript(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`TRPC Video Translation Server listening at port: ${port}`);
  console.log('Available endpoints:');
  console.log('- healthcheck (query)');
  console.log('- uploadVideo (mutation)');
  console.log('- getVideo (query)');
  console.log('- deleteVideo (mutation)');
  console.log('- createTranslationJob (mutation)');
  console.log('- updateTranslationJobStatus (mutation)');
  console.log('- getTranslationJob (query)');
  console.log('- getUserTranslationJobs (query)');
  console.log('- processTranslationPipeline (mutation)');
  console.log('- createSpeaker (mutation)');
  console.log('- createTranscriptSegment (mutation)');
  console.log('- getTranscript (query)');
}

start();