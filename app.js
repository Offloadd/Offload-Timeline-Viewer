');
        
        const existingKeys = new Map();
        currentEntries.forEach(entry => {
            const normalizedTimestamp = normalizeTimestamp(entry.Timestamp);
            const topic = (entry.Topic || entry['Topic Label'] || '').trim();
            const lifeArea = (entry['Life Area'] || '').trim();
            const stressor = (entry['Stressor %'] || entry['Stressors %'] || '').toString().trim();
            const stabilizer = (entry['Stabilizer %'] || entry['Stabilizers %'] || '').toString().trim();
            const opportunity = (entry['Opportunity %'] || '').toString().trim();
            const duplicateKey = `${normalizedTimestamp}|${topic}|${lifeArea}|${stressor}|${stabilizer}|${opportunity}`;
            existingKeys.set(duplicateKey, entry);
        });
        
        const trulyNewEntries = [];
        const duplicates = [];
        
        newEntries.forEach(entry => {
            const normalizedTimestamp = normalizeTimestamp(entry.Timestamp);
            const topic = (entry.Topic || entry['Topic Label'] || '').trim();
            const lifeArea = (entry['Life Area'] || '').trim();
            const stressor = (entry['Stressor %'] || entry['Stressors %'] || '').toString().trim();
            const stabilizer = (entry['Stabilizer %'] || entry['Stabilizers %'] || '').toString().trim();
            const opportunity = (entry['Opportunity %'] || '').toString().trim();
            const duplicateKey = `${normalizedTimestamp}|${topic}|${lifeArea}|${stressor}|${stabilizer}|${opportunity}`;
            
            if (existingKeys.has(duplicateKey)) {
                duplicates.push(duplicateKey);
                debugLog.push(`⏭️  Skipped duplicate: ${entry.Timestamp} - ${entry.Topic || entry['Topic Label'] || 'Unnamed'}`);
            } else {
                trulyNewEntries.push(entry);
                debugLog.push(`✅ Added: ${entry.Timestamp} - ${entry.Topic || entry['Topic Label'] || 'Unnamed'}`);
            }
        });
        
        let mergedEntries = [...currentEntries, ...trulyNewEntries];
        mergedEntries.sort((a, b) => {
            const dateA = new Date(a.Timestamp);
            const dateB = new Date(b.Timestamp);
            return dateB - dateA;
        });
        
        const beforeDedup = mergedEntries.length;
        const dedupResult = removeDuplicates(mergedEntries);
        mergedEntries = dedupResult.unique;
        const removedFromOriginal = beforeDedup - mergedEntries.length - duplicates.length;
        
        debugLog.push('---');
        debugLog.push(`<strong style="color: #059669;">✨ Merge Complete!</strong>`);
        debugLog.push(`Added: ${trulyNewEntries.length} new entries`);
        debugLog.push(`Skipped from import: ${duplicates.length} duplicates`);
        if (removedFromOriginal > 0) {
            debugLog.push(`Cleaned from original: ${removedFromOriginal} duplicates`);
        }
        debugLog.push(`Total: ${mergedEntries.length} entries`);
        
        const headers = Object.keys(mergedEntries[0]);
        let csvOutput = headers.join(',') + '\n';
        mergedEntries.forEach(entry => {
            const row = headers.map(h => {
                const value = entry[h] || '';
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(',');
            csvOutput += row + '\n';
        });
        
        document.getElementById('dataInput').value = csvOutput;
        statusDiv.innerHTML = debugLog.join('<br>');
        generateTimeline();
        
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: #dc2626;">❌ Error: ${error.message}</span><br><br>${error.stack}`;
        console.error(error);
    }
};
