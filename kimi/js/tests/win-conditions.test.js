/**
 * Win Conditions Test Suite
 * Comprehensive testing for win condition system
 */

import { WinConditionChecker, WinConditionType } from '../services/WinConditionChecker.js';
import { GameEngine } from '../engine/GameEngine.js';
import { Player } from '../models/Player.js';

describe('Win Condition System', () => {
    let gameEngine;
    let winChecker;
    let players;

    beforeEach(async () => {
        gameEngine = new GameEngine();
        await gameEngine.init();
        
        // Create test players
        players = [
            new Player({ id: 'player1', name: 'Alice', token: 'hat' }),
            new Player({ id: 'player2', name: 'Bob', token: 'car' }),
            new Player({ id: 'player3', name: 'Charlie', token: 'ship' })
        ];
        
        gameEngine.playerManager.players = players;
        winChecker = gameEngine.gameEndManager.winConditionChecker;
    });

    describe('WinConditionChecker', () => {
        test('should initialize with default configuration', () => {
            const config = winChecker.getConfiguration();
            expect(config[WinConditionType.LAST_PLAYER_STANDING].enabled).toBe(true);
            expect(config[WinConditionType.BANKRUPTCY].enabled).toBe(true);
        });

        test('should check last player standing condition', () => {
            // All players active
            let result = winChecker.checkWinCondition(WinConditionType.LAST_PLAYER_STANDING, {});
            expect(result.gameOver).toBe(false);

            // One player bankrupt
            players[1].declareBankrupt();
            result = winChecker.checkWinCondition(WinConditionType.LAST_PLAYER_STANDING, {});
            expect(result.gameOver).toBe(false);

            // Two players bankrupt
            players[2].declareBankrupt();
            result = winChecker.checkWinCondition(WinConditionType.LAST_PLAYER_STANDING, {});
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(players[0]);
        });

        test('should check bankruptcy condition', () => {
            // No bankruptcies
            let result = winChecker.checkWinCondition(WinConditionType.BANKRUPTCY, {});
            expect(result.gameOver).toBe(false);

            // One bankruptcy, still multiple players
            players[0].declareBankrupt();
            result = winChecker.checkWinCondition(WinConditionType.BANKRUPTCY, {});
            expect(result.gameOver).toBe(false);

            // Only one player left
            players[1].declareBankrupt();
            result = winChecker.checkWinCondition(WinConditionType.BANKRUPTCY, {});
            expect(result.gameOver).toBe(true);
        });

        test('should check net worth target condition', () => {
            const config = { targetAmount: 2000 };
            
            // No player meets target
            players[0].money = 1000;
            players[1].money = 1500;
            let result = winChecker.checkWinCondition(WinConditionType.NET_WORTH_TARGET, config);
            expect(result.gameOver).toBe(false);

            // Player meets target
            players[0].money = 2500;
            result = winChecker.checkWinCondition(WinConditionType.NET_WORTH_TARGET, config);
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(players[0]);
        });

        test('should check monopoly completion condition', () => {
            const config = { requiredMonopolies: 2 };
            
            // Mock properties for monopoly testing
            players[0].properties = [
                { id: 'prop1', colorGroup: 'brown' },
                { id: 'prop2', colorGroup: 'brown' },
                { id: 'prop3', colorGroup: 'light-blue' },
                { id: 'prop4', colorGroup: 'light-blue' },
                { id: 'prop5', colorGroup: 'light-blue' }
            ];
            
            let result = winChecker.checkWinCondition(WinConditionType.MONOPOLY_COMPLETION, config);
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(players[0]);
        });

        test('should check property domination condition', () => {
            const config = { requiredProperties: 5 };
            
            // Not enough properties
            players[0].properties = [{ id: 'prop1' }, { id: 'prop2' }, { id: 'prop3' }];
            let result = winChecker.checkWinCondition(WinConditionType.PROPERTY_DOMINATION, config);
            expect(result.gameOver).toBe(false);

            // Enough properties
            players[0].properties = [
                { id: 'prop1' }, { id: 'prop2' }, { id: 'prop3' },
                { id: 'prop4' }, { id: 'prop5' }, { id: 'prop6' }
            ];
            result = winChecker.checkWinCondition(WinConditionType.PROPERTY_DOMINATION, config);
            expect(result.gameOver).toBe(true);
        });

        test('should calculate player monopolies correctly', () => {
            players[0].properties = [
                { id: 'prop1', colorGroup: 'brown' },
                { id: 'prop2', colorGroup: 'brown' },
                { id: 'prop3', colorGroup: 'light-blue' },
                { id: 'prop4', colorGroup: 'light-blue' },
                { id: 'prop5', colorGroup: 'light-blue' }
            ];
            
            const monopolies = winChecker.getPlayerMonopolies(players[0]);
            expect(monopolies).toContain('brown');
            expect(monopolies).toContain('light-blue');
            expect(monopolies).toHaveLength(2);
        });

        test('should calculate final rankings correctly', () => {
            players[0].money = 2000;
            players[1].money = 1500;
            players[2].money = 1000;
            
            const rankings = winChecker.calculateFinalRankings();
            expect(rankings[0].player).toBe(players[0]);
            expect(rankings[1].player).toBe(players[1]);
            expect(rankings[2].player).toBe(players[2]);
        });

        test('should handle bankrupt players in rankings', () => {
            players[0].money = 2000;
            players[1].money = 1500;
            players[2].money = 1000;
            players[1].declareBankrupt();
            
            const rankings = winChecker.calculateFinalRankings();
            expect(rankings[0].player).toBe(players[0]);
            expect(rankings[1].player).toBe(players[2]);
            expect(rankings[2].player).toBe(players[1]);
            expect(rankings[2].isBankrupt).toBe(true);
        });

        test('should configure win conditions', () => {
            const newConfig = {
                [WinConditionType.NET_WORTH_TARGET]: {
                    enabled: true,
                    targetAmount: 3000
                }
            };
            
            winChecker.configureWinConditions(newConfig);
            const config = winChecker.getConfiguration();
            expect(config[WinConditionType.NET_WORTH_TARGET].enabled).toBe(true);
            expect(config[WinConditionType.NET_WORTH_TARGET].targetAmount).toBe(3000);
        });

        test('should enable/disable specific win conditions', () => {
            winChecker.setWinConditionEnabled(WinConditionType.NET_WORTH_TARGET, true);
            const config = winChecker.getConfiguration();
            expect(config[WinConditionType.NET_WORTH_TARGET].enabled).toBe(true);
            
            winChecker.setWinConditionEnabled(WinConditionType.NET_WORTH_TARGET, false);
            const updatedConfig = winChecker.getConfiguration();
            expect(updatedConfig[WinConditionType.NET_WORTH_TARGET].enabled).toBe(false);
        });
    });

    describe('GameEndManager', () => {
        test('should initialize with game engine', () => {
            expect(gameEngine.gameEndManager).toBeDefined();
            expect(gameEngine.gameEndManager.winConditionChecker).toBeDefined();
        });

        test('should handle game end correctly', async () => {
            players[1].declareBankrupt();
            players[2].declareBankrupt();
            
            const result = gameEngine.gameEndManager.winConditionChecker.checkAllWinConditions();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(players[0]);
        });

        test('should calculate final statistics', () => {
            const stats = gameEngine.gameEndManager.calculateFinalStatistics();
            expect(stats).toHaveProperty('players');
            expect(stats).toHaveProperty('game');
            expect(stats).toHaveProperty('achievements');
            expect(Array.isArray(stats.players)).toBe(true);
        });
    });

    describe('Integration Tests', () => {
        test('should integrate with game engine flow', async () => {
            const gameConfig = {
                players: [
                    { name: 'Test Player 1', token: 'hat' },
                    { name: 'Test Player 2', token: 'car' }
                ]
            };
            
            await gameEngine.startNewGame(gameConfig);
            expect(gameEngine.isGameActive()).toBe(true);
            
            // Simulate game progression
            gameEngine.gameState.gameRound = 10;
            const result = gameEngine.checkGameOver();
            expect(typeof result).toBe('boolean');
        });

        test('should handle edge cases', () => {
            // Test with no players
            gameEngine.playerManager.players = [];
            const result = winChecker.checkAllWinConditions();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBeNull();
            
            // Test with all bankrupt players
            players.forEach(p => p.declareBankrupt());
            const bankruptResult = winChecker.checkAllWinConditions();
            expect(bankruptResult.gameOver).toBe(true);
            expect(bankruptResult.winner).toBeNull();
        });

        test('should handle simultaneous bankruptcy', () => {
            // Create scenario where multiple players go bankrupt
            players[0].money = -100;
            players[1].money = -100;
            players[2].money = 100;
            
            players[0].declareBankrupt();
            players[1].declareBankrupt();
            
            const result = winChecker.checkAllWinConditions();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe(players[2]);
        });
    });

    describe('Real-time Monitoring', () => {
        test('should start and stop monitoring', () => {
            winChecker.startMonitoring();
            expect(winChecker.monitoringEnabled).toBe(true);
            
            winChecker.stopMonitoring();
            expect(winChecker.monitoringEnabled).toBe(false);
        });

        test('should reset correctly', () => {
            winChecker.startTime = Date.now() - 1000000;
            winChecker.reset();
            expect(winChecker.startTime).toBeCloseTo(Date.now(), -2);
            expect(winChecker.monitoringEnabled).toBe(true);
        });
    });
});

// Test runner
if (typeof window !== 'undefined') {
    // Browser environment
    window.runWinConditionTests = () => {
        console.log('Running win condition tests...');
        // Test runner would be implemented here
    };
}