import { eq } from 'drizzle-orm';
import { db, pool } from './index.js';
import { matches, commentary, matchStatusEnum } from './schema.js';

async function main() {
  try {
    console.log('🏟️ Sports Application - CRUD Demo\n');

    // CREATE: Insert a new match
    console.log('📝 CREATE: Adding a new match...');
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Football',
        homeTeam: 'Manchester United',
        awayTeam: 'Liverpool',
        status: 'scheduled',
        startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        homeScore: 0,
        awayScore: 0,
      })
      .returning();

    if (!newMatch) throw new Error('Failed to create match');
    console.log('✅ Match created:', {
      id: newMatch.id,
      homeTeam: newMatch.homeTeam,
      awayTeam: newMatch.awayTeam,
      status: newMatch.status,
    });

    // READ: Fetch the match
    console.log('\n📖 READ: Fetching the match...');
    const foundMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.id, newMatch.id));
    console.log('✅ Match found:', foundMatches[0]);

    // UPDATE: Change match status to live
    console.log('\n✏️ UPDATE: Updating match status to live...');
    const [updatedMatch] = await db
      .update(matches)
      .set({ status: 'live' })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!updatedMatch) throw new Error('Failed to update match');
    console.log('✅ Match updated:', {
      id: updatedMatch.id,
      status: updatedMatch.status,
    });

    // CREATE: Add commentary for the match
    console.log('\n💬 CREATE: Adding match commentary...');
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 23,
        sequence: 1,
        period: 'first_half',
        eventType: 'goal',
        actor: 'Bruno Fernandes',
        team: 'Manchester United',
        message: 'Brilliant free-kick goal!',
        metadata: {
          videoTimestamp: '00:23:15',
          replaysAvailable: true,
        },
        tags: ['goal', 'free_kick', 'manchester_united'],
      })
      .returning();

    if (!newCommentary) throw new Error('Failed to create commentary');
    console.log('✅ Commentary added:', {
      id: newCommentary.id,
      minute: newCommentary.minute,
      eventType: newCommentary.eventType,
      actor: newCommentary.actor,
    });

    // READ: Fetch all commentary for the match
    console.log('\n📖 READ: Fetching match commentary...');
    const matchCommentary = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, newMatch.id));
    console.log('✅ Commentary retrieved:', matchCommentary.length, 'entries');

    // UPDATE: Update match scores
    console.log('\n✏️ UPDATE: Updating match scores...');
    const [finalMatch] = await db
      .update(matches)
      .set({ homeScore: 1, awayScore: 0, status: 'finished' })
      .where(eq(matches.id, newMatch.id))
      .returning();

    if (!finalMatch) throw new Error('Failed to update scores');
    console.log('✅ Final score updated:', {
      id: finalMatch.id,
      homeScore: finalMatch.homeScore,
      awayScore: finalMatch.awayScore,
      status: finalMatch.status,
    });

    // DELETE: Remove the commentary
    console.log('\n🗑️ DELETE: Removing commentary...');
    await db.delete(commentary).where(eq(commentary.id, newCommentary.id));
    console.log('✅ Commentary deleted.');

    // DELETE: Remove the match
    console.log('\n🗑️ DELETE: Removing match...');
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ Match deleted.');

    console.log('\n✨ CRUD operations completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Database pool closed.');
    }
  }
}

main();
