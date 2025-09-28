# UNIFIED SESSION STATE PRESERVATION PROMPT
# Copy this entire block and give it to Warp AI at the end of each session
# This ensures complete context restoration for the next session

---

## 🔄 SESSION CONTINUATION REQUEST

**Context**: I'm not signed in to Warp, so I need to preserve all session state manually. Please help me continue from where I left off.

### 📍 **Current Project State**
- **Project**: Eventra SaaS Application  
- **Directory**: `C:\Users\HB LAPTOP STORE\4phasteprompt-eventra\eventra-saas`
- **Platform**: Windows 11, PowerShell 5.1.26100.6584
- **Last Session**: {{DATE_TIME}}

### 🎯 **Active Work Items**
**Current Task**: {{CURRENT_TASK}}

**Recent Progress**:
{{RECENT_PROGRESS}}

**Next Steps**:
{{NEXT_STEPS}}

**Blockers/Issues**:
{{ISSUES_OR_BLOCKERS}}

### 📊 **Repository State**
```powershell
# Git Status Snapshot
{{GIT_STATUS}}

# Current Branch
{{CURRENT_BRANCH}}

# Recent Commits (last 5)
{{RECENT_COMMITS}}

# Stashed Work
{{STASHED_WORK}}

# Uncommitted Changes
{{UNCOMMITTED_CHANGES}}
```

### 🏗️ **Architecture Context**
**Tech Stack**: 
- Next.js 13+ (App Router)
- React with TypeScript
- Tailwind CSS  
- i18next for internationalization
- {{OTHER_TECH_USED}}

**Key Files Modified**:
{{MODIFIED_FILES}}

**Dependencies**:
{{KEY_DEPENDENCIES}}

### 🐛 **Known Issues & Solutions**
**Current Issues**:
{{CURRENT_ISSUES}}

**Applied Solutions**:
{{SOLUTIONS_APPLIED}}

**Pending Fixes**:
{{PENDING_FIXES}}

### 📝 **Code Context**
**Recent Code Changes**:
```{{LANGUAGE}}
{{CODE_SNIPPETS}}
```

**Import/Export Dependencies**:
{{DEPENDENCIES_MAP}}

**Component Hierarchy**:
{{COMPONENT_STRUCTURE}}

### 🧪 **Testing State**
**Last Test Results**:
{{TEST_RESULTS}}

**Test Coverage**:
{{COVERAGE_INFO}}

**Failed Tests**:
{{FAILED_TESTS}}

### 🚀 **Deployment Context**
**Environment**: {{ENVIRONMENT}}
**Build Status**: {{BUILD_STATUS}}
**Deployment Issues**: {{DEPLOYMENT_ISSUES}}

### 💡 **Session Notes**
**Key Insights**:
{{KEY_INSIGHTS}}

**Lessons Learned**:
{{LESSONS_LEARNED}}

**Important Decisions Made**:
{{DECISIONS_MADE}}

### 🔧 **Environment Setup**
**Required Tools**:
{{REQUIRED_TOOLS}}

**Environment Variables**:
{{ENV_VARS_NEEDED}}

**Configuration**:
{{CONFIG_SETTINGS}}

### 📋 **Action Items for Next Session**
1. {{ACTION_ITEM_1}}
2. {{ACTION_ITEM_2}}  
3. {{ACTION_ITEM_3}}
4. {{ACTION_ITEM_4}}
5. {{ACTION_ITEM_5}}

### 🎯 **Immediate Goals**
**Short-term (this session)**:
{{SHORT_TERM_GOALS}}

**Medium-term (this week)**:
{{MEDIUM_TERM_GOALS}}

**Long-term (project milestone)**:
{{LONG_TERM_GOALS}}

### 🔍 **Search Context**
**Recent Searches**:
{{RECENT_SEARCHES}}

**Useful Commands**:
{{USEFUL_COMMANDS}}

**File Locations**:
{{IMPORTANT_FILE_PATHS}}

### 📚 **Reference Materials**
**Documentation Links**:
{{DOCUMENTATION_LINKS}}

**Stack Overflow Solutions**:
{{SO_SOLUTIONS}}

**GitHub Issues/PRs**:
{{GITHUB_REFERENCES}}

---

## 🎬 **SESSION RESTORATION INSTRUCTIONS**

When I return:
1. **First Priority**: {{FIRST_PRIORITY}}
2. **Check Status**: Run `git status` and `npm run build`
3. **Restore Context**: {{CONTEXT_RESTORATION_STEPS}}
4. **Continue Work**: Pick up from "{{PICKUP_POINT}}"

**Expected Next Commands**:
```powershell
{{EXPECTED_COMMANDS}}
```

**Files to Review**:
- {{FILE_1}}
- {{FILE_2}}
- {{FILE_3}}

---

## ⚡ **QUICK START TEMPLATE**

```powershell
# Quick session start commands
cd "C:\Users\HB LAPTOP STORE\4phasteprompt-eventra\eventra-saas"
git status
git log --oneline -5
git stash list
npm run dev
# {{OTHER_STARTUP_COMMANDS}}
```

---

**🔥 CRITICAL**: {{CRITICAL_REMINDERS}}

**🎯 RESUME FROM**: {{EXACT_PICKUP_POINT}}

---

*Session preserved at: {{TIMESTAMP}}*
*Next session: Continue with "{{CONTINUATION_PHRASE}}"*