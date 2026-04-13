const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'settings.html');
let content = fs.readFileSync(filePath, 'utf8');

// The clean singular block we want
const cleanShortcutsTab = `        <!-- NEW SHORTCUTS TAB -->
        <div class="tab-content" id="shortcuts">
          <div class="shortcuts-header-container">
            <h3>⌨️ Custom Keyboard Shortcuts</h3>
            <p>Record your own shortcuts for faster navigation. Press <b>Escape</b> to clear.</p>
          </div>
          
          <div class="shortcuts-card-grid">
            <div class="shortcut-item-card">
                <label>Dashboard</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="dashboard" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + D</div>
                </div>
            </div>
            <div class="shortcut-item-card">
                <label>New Customer</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="new-customer" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + N</div>
                </div>
            </div>
            <div class="shortcut-item-card">
                <label>Directory</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="customer-directory" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + C</div>
                </div>
            </div>
            <div class="shortcut-item-card">
                <label>Reports</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="reports" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + R</div>
                </div>
            </div>
            <div class="shortcut-item-card">
                <label>Expenses</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="expenses" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + E</div>
                </div>
            </div>
            <div class="shortcut-item-card">
                <label>Settings</label>
                <div class="shortcut-input-group">
                    <input type="text" readonly data-action="settings" class="shortcut-recording-input" placeholder="Record...">
                    <div class="current-key-display">Alt + S</div>
                </div>
            </div>
          </div>
          
          <div class="shortcuts-actions-footer">
            <button class="btn-save" id="saveShortcuts">Save Shortcuts</button>
            <button class="btn-primary" id="resetShortcuts">Reset Defaults</button>
          </div>
        </div>
      </div>
    </div>`;

// Search from "<!-- NEW SHORTCUTS TAB -->" to "<!-- RESET MODAL -->"
const startTag = '<!-- NEW SHORTCUTS TAB -->';
const endTag = '<!-- RESET MODAL -->';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
    const updatedContent = content.substring(0, startIdx) + cleanShortcutsTab + '\n\n    ' + content.substring(endIdx);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log('Successfully fixed settings.html duplication and nesting.');
} else {
    console.log('Error: Could not find markers in settings.html');
}
