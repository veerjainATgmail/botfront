
/* global cy:true */
/* global Cypress:true */

describe('Story play button', function() {
    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.MeteorCall('storyGroups.insert', [
            {
                _id: 'PLAY_BUTTON',
                name: 'Test Group',
                projectId: 'bf',
            },
        ]);
        cy.MeteorCall('stories.insert', [
            {
                _id: 'TESTSTORY',
                projectId: 'bf',
                type: 'rule',
                storyGroupId: 'PLAY_BUTTON',
                steps: [
                    { intent: 'test_play_button' },
                    { action: 'utter_play_success' },
                ],
                title: 'Test Story',
            },
        ]);
        cy.waitForResolve(Cypress.env('RASA_URL'));
    });

    afterEach(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('should open and start a new story in the chat when the play button is pressed', () => {
        cy.visit('/project/bf/dialogue');
        cy.train();
        cy.browseToStory('Test Story', 'Test Group');
        cy.dataCy('story-title').should('have.value', 'Test Story');
        cy.dataCy('play-story').click();
        cy.get('span.rw-loading').should('not.exist');
        cy.dataCy('chat-pane').find('p').contains('utter_play_success');
    });
    it('should disable the play button when a story does not start with a user utterance', () => {
        cy.visit('/project/bf/dialogue');
        cy.browseToStory('Test Story', 'Test Group');
        cy.get('.story-line').should('have.length', 2);
        cy.dataCy('icon-trash').first().click({ force: true });
        cy.get('.story-line').should('have.length', 1);
        cy.dataCy('play-story').should('have.class', 'disabled').click({ force: true });
        cy.dataCy('chat-pane').should('not.exist');
        cy.dataCy('play-story').should('have.class', 'disabled');
    });
});
