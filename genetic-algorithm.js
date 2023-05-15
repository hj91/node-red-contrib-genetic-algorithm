/**

 Copyright 2023 Bufferstack.IO Analytics Technology LLP, Pune

 Licensed under the GNU General Public License, Version 3.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 https://www.gnu.org/licenses/gpl-3.0.html

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 **/

// Harshad Joshi, 2023
// Release data - 27 April 2023


module.exports = function(RED) {
    function GeneticAlgorithmNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var target = config.target;
        var populationSize = config.populationSize;
        var mutationRate = config.mutationRate;
        var possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ";

        function generateIndividual(length) {
            var result = '';
            for (var i = 0; i < length; i++) {
                result += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            }
            return result;
        }

        function initializePopulation(populationSize, length) {
            var population = [];
            for (var i = 0; i < populationSize; i++) {
                population.push(generateIndividual(length));
            }
            return population;
        }

        function fitness(individual) {
            var score = 0;
            for (var i = 0; i < individual.length; i++) {
                if (individual[i] == target[i]) {
                    score++;
                }
            }
            return score / target.length;
        }

        function evaluate(population) {
            return population.map(individual => ({ individual, fitness: fitness(individual) }));
        }

        function select(evaluatedPopulation) {
            evaluatedPopulation.sort((a, b) => b.fitness - a.fitness);
            return evaluatedPopulation.slice(0, populationSize / 2).map(ep => ep.individual);
        }

        function crossover(population) {
            while (population.length < populationSize) {
                var parent1 = population[Math.floor(Math.random() * population.length)];
                var parent2 = population[Math.floor(Math.random() * population.length)];
                var midpoint = Math.floor(Math.random() * parent1.length);
                var offspring = parent1.substring(0, midpoint) + parent2.substring(midpoint);
                population.push(offspring);
            }
        }

        function mutate(population, mutationRate) {
            for (var i = 0; i < population.length; i++) {
                if (Math.random() < mutationRate) {
                    var index = Math.floor(Math.random() * population[i].length);
                    var newChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
                    population[i] = population[i].substring(0, index) + newChar + population[i].substring(index + 1);
                }
            }
        }

        function geneticAlgorithm() {
            var population = initializePopulation(populationSize, target.length);
            var generation = 0;
            while (true) {
                var evaluatedPopulation = evaluate(population);
                if (evaluatedPopulation[0].fitness == 1) {
                    return { 
                        individual: evaluatedPopulation[0].individual, 
                        fitness: evaluatedPopulation[0].fitness, 
                        generation,
                        target,
                        populationSize,
                        mutationRate
                    };
                }
                population = select(evaluatedPopulation);
                crossover(population);
                mutate(population, mutationRate);
                generation++;
            }
        }

        node.on('input', function(msg) {
            var result = geneticAlgorithm();
            msg.payload = {
                best_individual: result.individual,
                fitness: result.fitness,
                generation: result.generation,
                target: result.target,
                population_size: result.populationSize,
                mutation_rate: result.mutationRate
            };
            node.send(msg);
        });
    }

    RED.nodes.registerType("genetic-algorithm", GeneticAlgorithmNode);
}

