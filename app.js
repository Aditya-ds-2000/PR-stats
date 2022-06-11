const { Octokit } = require('@octokit/core');
const { createAppAuth } = require('@octokit/auth-app');
const express = require('express');
const fs = require('fs');
const math = require('mathjs');
const crypto = require('crypto');

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('json spaces', 2);
app.use(express.static('public'));

const auth = {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    appId: process.env.APP_ID,
    privateKey: fs.readFileSync('./creds/pr-statistics.2022-06-10.private-key.pem').toString('utf-8'),
    installationId: process.env.INSTALLATION_ID,
};
const owner = 'powerplay-developers';
const repo = 'powerplay-backend';

// const appAuthentication = await auth({ type: 'app' });
// https://github.com/apps/pr-statistics/installations/26437616

const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth,
});

app.get('/', async (req, res) => {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        repo,
        owner,
        state: 'closed'
    });

    const stats = {};
    data.forEach((pr) => {
        if (pr.user.type === 'Bot' || !pr.merged_at) return;
        const author = pr.user.login;
        const timeToMerge = (new Date(pr.merged_at) - new Date(pr.created_at)) / (24 * 60 * 60 * 1000);
        if (!stats[author]) {
            stats[author] = { times_to_merge: [] };
        }
        stats[author].times_to_merge.push(timeToMerge);
        stats[author].avg_time_to_merge = math.mean(stats[author].times_to_merge);
        stats[author].median_time_to_merge = math.median(stats[author].times_to_merge);
    });

    const colors = new Array(Object.keys(stats).length).fill(0).map(_ => `#${crypto.randomBytes(3).toString('hex')}`);
    res.render('index', { stats: JSON.stringify(stats), colors });
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('http://localhost:8000');
});
