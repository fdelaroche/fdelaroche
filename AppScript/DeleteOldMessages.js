/**
 * This requires access to
 * - your Google Drive to get the name of the script,
 * - your email address to send you an execution report,
 * - your gmail account (obviously)
 */

const USER_EMAIL = Session.getEffectiveUser().getEmail();
const SCRIPT_ID = ScriptApp.getScriptId();
const SCRIPT_NAME = DriveApp.getFileById(SCRIPT_ID).getName();

const DEBUG = true;

// Configure the rules below
const rules = [
	{
		name: "LinkedIn",
		label: 'inbox',
		ignoreLabeled: true,
		sender: ["jobalerts-noreply@linkedin.com", "jobs-listings@linkedin.com", "jobs-noreply@linkedin.com"],
		age: "15d"
	},
	{
		name: "This scripts' logs",
		sender: USER_EMAIL,
		title: `Execution result of ${SCRIPT_NAME}`,
		age: "2d"
	}
];

function main() {
	try {
		for (const rule of rules) {
			Logger.log(`Running rule: ${rule.name}`);
			processDelete(rule);
		};
	} catch (error) {
		Logger.log(`ERROR while processing rule ${rule.name}: ${error.message}`);
	}
	sendReport();
}

/**
 * Send the logs by email to the script owner
 * Disabled if DEBUG is true
 */
function sendReport() {
	if (DEBUG) { return }

	GmailApp.sendEmail(
		USER_EMAIL,
		`Execution result of ${SCRIPT_NAME}`,
		Logger.getLog()
	);
}

function buildSearchQuery({label, sender, age, title}) {
	let searchQuery = '';

	if (sender !== undefined) {
		searchQuery += `from:(${[sender].flat().join('|')}) `;
	}
	if (label !== undefined) {
		searchQuery += `label:${label} `;
	}
	if (age !== undefined) {
		searchQuery += `older_than:${age} `;
	}
	if (title !== undefined) {
		searchQuery += `subject:(\"${title}\") `;
	}
	Logger.log("Search query: " + searchQuery);
	return searchQuery;
}

function getAllLabelNames(thread) {
	return thread.getLabels().map(({getName}) => getName());
}

function deleteThread({ threads }) {
		if (DEBUG) {
			for (thread of threads) {
				Logger.log(`Would move to the trash "${thread.getFirstMessageSubject()}", dated: ${thread.getLastMessageDate()}, with label(s): ${getAllLabelNames(thread)}`);
			}
			Logger.log(`Would have delete ${threads.length} threads(s)`);
		} else {
			for (thread of threads) {
				Logger.log(`Moving to the trash "${thread.getFirstMessageSubject()}", dated: ${thread.getLastMessageDate()}, with label(s): ${getAllLabelNames(thread)}`);
			}
			GmailApp.moveThreadsToTrash(threads);
			Logger.log(`Deleted ${threads.length} thread(s)`);
		}
}

function shouldDeleteThread({ thread, ignoreLabeled }) {
	if (ignoreLabeled && thread.getLabels().length >= 1) {
		Logger.log(`Skipping thread "${thread.getFirstMessageSubject()}" ,dated: ${thread.getLastMessageDate()} because it has been labeled (${getAllLabelNames(thread).join(', ')})`);
		return false;
	}
	return true;
}

/**
 * label: the label the thread should have
 * ignoreLabeled: skip deleting message that have been labeled
 * sender: email of the sender
 * age: relative date string (e.g. "2d", for 2 days old threads)
 * title: subject of the thread
 */
function processDelete({label, ignoreLabeled, sender, age, title}) {
	const searchQuery = buildSearchQuery({label, sender, age, title});
	const threads = GmailApp.search(searchQuery);
	
	Logger.log(`Threads found: ${threads.length}`);
	const threadsToDelete = [];

	for (const thread of threads) {
		if (shouldDeleteThread({thread, ignoreLabeled })) {
			threadsToDelete.push(thread);
		}
	}
	deleteThread({ threads: threadsToDelete });
}
