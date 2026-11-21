# MASTER PROMPT: Build VS Math Kids – Complete Flutter Educational Game

Act as a senior Flutter developer, educational game designer, UI/UX designer, and mobile game architect.

Build a complete, production-quality Android educational mathematics game inspired by the gameplay and learning experience of Math Kids by RV AppStudios.

The application name is **VS Math Kids – Fun Learning Games**.

IMPORTANT:
- Build an original application, not a copy of proprietary source code or copyrighted assets.
- Do not use the original app's name, logo, characters, or artwork.
- Create original cartoon characters, illustrations, sounds, and game assets.
- Every game mode must be functional, not just a UI mockup.
- Prioritize children aged 3–8 years.
- Make the application fully playable offline.

## 1. TECHNOLOGY STACK

Frontend:
- Flutter
- Dart
- Material 3 with custom colorful game components
- Responsive layouts for mobile phones and tablets

Game development:
- Flutter animations
- CustomPainter where necessary
- GestureDetector and drag-and-drop interactions
- Lottie animations where appropriate
- Just Audio for sound effects and voice instructions

Local storage:
- Hive or Isar for local progress
- SharedPreferences for settings

Future backend:
- Firebase Authentication (optional parent accounts)
- Cloud Firestore for cloud progress synchronization
- Firebase Analytics only with appropriate privacy safeguards

Do not require a backend for the first version.

## 2. APPLICATION DESIGN

Create a bright, attractive preschool educational game.

Design inspiration:
- Colorful backgrounds
- Large rounded buttons
- Cartoon animals
- Colorful number blocks
- Interactive objects such as apples, ducks, candies, cars, stars and balloons
- Smooth animations
- Attractive reward effects
- Simple navigation

Color palette:
- Primary blue: #287BFF
- Yellow: #FFD83D
- Pink: #FF55AE
- Green: #35D66F
- Orange: #FF963C
- Purple: #9755F5
- White: #FFFFFF

Use large readable typography and touch-friendly controls.

Create original mascots:
- Leo the Lion
- Bella the Bunny
- Coco the Duck

These characters should guide children through activities using friendly animations and optional voice instructions.

## 3. MAIN SCREENS

Create the following screens:

1. Splash Screen
   - Original application logo
   - Animated mascot
   - Loading animation

2. Welcome Screen
   - Welcome message
   - Play button
   - Parent Zone
   - Language selector

3. Child Profile Screen
   - Create multiple child profiles
   - Enter nickname
   - Select avatar
   - Select learning level

4. Home Screen
   - Animated background
   - Main mascot
   - Daily learning progress
   - Stars earned
   - Game categories
   - Settings button
   - Parent Zone button

5. Game Selection Screen
   - Display games in colorful cards
   - Show game illustrations
   - Display difficulty level
   - Display completed activities

6. Individual Game Screens
   - Each game must have its own functional interface.

7. Results Screen
   - Correct answers
   - Wrong answers
   - Stars earned
   - Completion animation
   - Play Again button
   - Next Level button

8. Parent Dashboard
   - Learning progress
   - Game history
   - Accuracy percentage
   - Time spent learning
   - Difficulty settings

## 4. GAME MODES – CORE FEATURES

Implement these 12 functional game modes.

### Game 1: Count Objects
- Display objects such as apples, bananas, stars and ducks.
- Ask children to count objects.
- Display 3–4 answer options.
- Give instant feedback.
- Generate random questions.

Example: Display 5 apples and ask how many apples are present.

### Game 2: Compare Numbers
- Display two groups of objects.
- Ask which group has more or fewer objects.
- Use greater-than, less-than and equal-to symbols.
- Support drag-and-drop answers.

### Game 3: Addition Puzzle
- Display an equation with a missing number.
- Allow children to drag number blocks into the answer area.
- Validate the answer.
- Show visual object counting.

### Game 4: Addition Fun
- Show two groups of objects.
- Display an addition equation.
- Ask children to select the correct sum.
- Include animated object grouping.

### Game 5: Addition Quiz
- Generate random addition questions.
- Provide multiple-choice answers.
- Support levels from 0–5, 0–10, 0–20 and 0–100.

### Game 6: Subtraction Puzzle
- Display subtraction equations.
- Allow children to fill missing numbers and symbols.
- Use visual objects to explain subtraction.

### Game 7: Subtraction Fun
- Display a group of objects.
- Animate objects disappearing when subtracted.
- Ask how many remain.

### Game 8: Subtraction Quiz
- Generate random subtraction problems.
- Include easy, medium and advanced levels.
- Provide instant feedback.

### Game 9: Math Pyramid
- Create number pyramid puzzles.
- Each upper block represents the sum of the two blocks below it.
- Allow children to fill missing blocks.
- Generate multiple puzzle variations.

### Game 10: Missing Numbers
- Display incomplete equations.
- Example: 4 + ? = 9.
- Provide number choices.
- Support addition and subtraction.

### Game 11: Math Practice
- Random mathematics exercises.
- Addition, subtraction and number recognition.
- Include a timer option.
- Offer easy, medium and hard levels.

### Game 12: Logic Puzzles
- Number grids
- Number patterns
- Missing number puzzles
- Simple mathematical reasoning
- Compare and complete sequences.

## 5. ADDITIONAL GAMEPLAY FEATURES

Implement:
- Ten Frame Addition
- Three Number Addition
- Number Recognition
- Counting from 1 to 100
- Number Matching
- Object Sorting
- Number Sequences
- Simple Word Problems
- Math Racing Challenge

Math Racing:
- Children solve math questions.
- Correct answers move their cartoon car forward.
- Display a finish line and winning animation.
- Make the game child-friendly and non-stressful.

## 6. DIFFICULTY SYSTEM

Create three learning levels:

Easy:
- Ages 3–4
- Counting 1–10
- Addition within 5
- Subtraction within 5

Medium:
- Ages 5–6
- Counting 1–50
- Addition within 20
- Subtraction within 20

Advanced:
- Ages 7–8
- Counting 1–100
- Addition within 100
- Subtraction within 100
- Missing numbers
- Logic puzzles

Allow parents to customize number ranges.

## 7. REWARD SYSTEM

Create a reward system:
- Earn stars for correct answers.
- Award badges for completing activities.
- Unlock new mascot outfits.
- Display daily achievements.
- Add celebration animations.
- Create a sticker collection.
- Add a virtual reward garden.

Never punish children for incorrect answers.

Use encouraging messages:
- Great Job!
- Amazing!
- Well Done!
- Let's Try Again!
- You're a Math Star!

## 8. AUDIO AND ANIMATIONS

Add:
- Correct-answer sound
- Incorrect-answer gentle sound
- Button click sound
- Celebration sound
- Background music toggle
- Voice instructions
- Mascot animations
- Object counting animations
- Star explosion effects
- Smooth screen transitions

All audio must be optional and configurable.

## 9. PARENT ZONE

Create a protected Parent Zone.

Include:
- Child profile management
- Learning statistics
- Game history
- Difficulty controls
- Sound settings
- Language settings
- Screen-time information

Use a simple parental verification gate before opening parent-only features.

## 10. MULTILINGUAL SUPPORT

Initially support:
- English
- Hindi

Prepare localization architecture for:
- Spanish
- French
- German
- Portuguese
- Arabic
- Other languages later.

Translate all questions, instructions and voice prompts.

## 11. OFFLINE AND PERFORMANCE

The application must:
- Work without internet.
- Store progress locally.
- Load games quickly.
- Run smoothly on budget Android devices.
- Support different screen sizes.
- Avoid unnecessary network requests.
- Avoid excessive memory usage.

Do not require login to play.

## 12. CHILD SAFETY AND PRIVACY

- No third-party advertisements in the initial version.
- No external links accessible directly by children.
- No unrestricted chat or social features.
- No collection of unnecessary personal information.
- Parent-only access to settings.
- Follow Google Play Families Policy and applicable child privacy requirements.
- Include a privacy policy before publication.

## 13. PROJECT ARCHITECTURE

Use clean, modular architecture.

Suggested structure:

lib/
  main.dart
  app.dart

  core/
    constants/
    theme/
    routes/
    audio/
    storage/
    localization/

  models/
    child_profile.dart
    question_model.dart
    game_result.dart
    achievement.dart

  services/
    question_generator.dart
    progress_service.dart
    reward_service.dart
    audio_service.dart

  features/
    splash/
    onboarding/
    profiles/
    home/
    games/
      counting/
      comparison/
      addition_puzzle/
      addition_fun/
      addition_quiz/
      subtraction_puzzle/
      subtraction_fun/
      subtraction_quiz/
      math_pyramid/
      missing_numbers/
      math_practice/
      logic_puzzles/
      math_racing/
    rewards/
    parent_dashboard/
    settings/

  shared/
    widgets/
    animations/
    components/

assets/
  images/
  characters/
  backgrounds/
  sounds/
  fonts/
  animations/

test/

## 14. DEVELOPMENT REQUIREMENTS

Work in the following order:

Phase 1:
- Initialize Flutter project.
- Configure dependencies.
- Create application theme.
- Build splash, welcome and home screens.

Phase 2:
- Implement question generator.
- Build counting and comparison games.
- Implement addition and subtraction.

Phase 3:
- Implement all puzzle games.
- Add math racing.
- Add difficulty management.

Phase 4:
- Implement stars, badges and rewards.
- Implement child profiles.
- Implement local progress storage.

Phase 5:
- Implement parent dashboard.
- Add audio, animations and Hindi localization.
- Add privacy and safety controls.

Phase 6:
- Test every game.
- Fix UI and gameplay bugs.
- Optimize performance.
- Generate Android release APK and AAB.

## 15. QUALITY REQUIREMENTS

Do not:
- Create buttons that do nothing.
- Use placeholder screens for core games.
- Hardcode only a few questions.
- Repeat identical questions excessively.
- Use copyrighted original game assets.
- Put all application code into main.dart.

Do:
- Write reusable widgets.
- Generate varied questions dynamically.
- Keep game logic separate from UI.
- Add error handling.
- Test scoring and answer validation.
- Save progress correctly.
- Make all screens responsive.

## 16. FINAL DELIVERABLES

Provide:
1. Complete Flutter source code.
2. Working 12 core game modes.
3. Original game artwork and assets.
4. Functional home screen and navigation.
5. Local database and progress tracking.
6. Parent dashboard.
7. English and Hindi localization.
8. Unit and widget tests.
9. Android APK.
10. Play Store AAB.
11. README with setup instructions.
12. Privacy policy requirements and Play Store publishing checklist.

Start by building a working Flutter MVP. Do not generate the entire project as disconnected code snippets. Create the actual project files, implement features incrementally, run Flutter analysis and tests, and fix errors before proceeding.

The final result should feel like a polished, child-friendly educational game that parents can trust and children enjoy using every day.
