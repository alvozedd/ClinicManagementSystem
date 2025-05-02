/**
 * Dashboard Component Verification Script
 * 
 * This script helps verify that all dashboard components are properly loaded and functioning.
 * Run this in the browser console when on any dashboard page.
 */

// Verify dashboard layout
function verifyDashboardLayout() {
  console.log('Verifying dashboard layout...');
  
  const results = {
    sidebar: false,
    header: false,
    mainContent: false,
    mobileMenu: false
  };
  
  // Check for sidebar
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebar) {
    results.sidebar = true;
    console.log('✅ Sidebar found');
  } else {
    console.error('❌ Sidebar not found');
  }
  
  // Check for header
  const header = document.querySelector('.dashboard-header');
  if (header) {
    results.header = true;
    console.log('✅ Header found');
  } else {
    console.error('❌ Header not found');
  }
  
  // Check for main content
  const mainContent = document.querySelector('.dashboard-content');
  if (mainContent) {
    results.mainContent = true;
    console.log('✅ Main content found');
  } else {
    console.error('❌ Main content not found');
  }
  
  // Check for mobile menu button
  const mobileMenu = document.querySelector('.mobile-menu-button');
  if (mobileMenu) {
    results.mobileMenu = true;
    console.log('✅ Mobile menu button found');
  } else {
    console.error('❌ Mobile menu button not found');
  }
  
  const success = Object.values(results).every(Boolean);
  console.log(`Dashboard layout verification: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return { success, results };
}

// Verify navigation links
function verifyNavigationLinks() {
  console.log('Verifying navigation links...');
  
  const navLinks = document.querySelectorAll('.nav-link');
  const results = {
    hasLinks: false,
    linksClickable: true
  };
  
  if (navLinks.length > 0) {
    results.hasLinks = true;
    console.log(`✅ Found ${navLinks.length} navigation links`);
    
    // Check if links are clickable
    navLinks.forEach(link => {
      if (!link.getAttribute('href') && !link.onclick) {
        results.linksClickable = false;
        console.error(`❌ Link "${link.textContent.trim()}" is not clickable`);
      }
    });
    
    if (results.linksClickable) {
      console.log('✅ All navigation links are clickable');
    }
  } else {
    console.error('❌ No navigation links found');
  }
  
  const success = results.hasLinks && results.linksClickable;
  console.log(`Navigation links verification: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return { success, results };
}

// Verify user info display
function verifyUserInfo() {
  console.log('Verifying user info display...');
  
  const results = {
    userInfoDisplayed: false,
    roleDisplayed: false
  };
  
  // Check for user name display
  const userNameElement = document.querySelector('.user-name') || 
                          document.querySelector('.username') || 
                          document.querySelector('.user-info');
  
  if (userNameElement) {
    results.userInfoDisplayed = true;
    console.log('✅ User info display found');
  } else {
    console.error('❌ User info display not found');
  }
  
  // Check for role display
  const roleElement = document.querySelector('.user-role') || 
                      document.querySelector('.role');
  
  if (roleElement) {
    results.roleDisplayed = true;
    console.log('✅ User role display found');
  } else {
    console.warn('⚠️ User role display not found (may be intentional)');
  }
  
  const success = results.userInfoDisplayed; // Only require user info, role is optional
  console.log(`User info verification: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return { success, results };
}

// Verify logout functionality
function verifyLogoutButton() {
  console.log('Verifying logout button...');
  
  const results = {
    logoutButtonFound: false,
    logoutButtonClickable: false
  };
  
  // Check for logout button
  const logoutButton = document.querySelector('.logout-button') || 
                       document.querySelector('button[type="button"]:not(.mobile-menu-button)') ||
                       Array.from(document.querySelectorAll('button')).find(btn => 
                         btn.textContent.toLowerCase().includes('logout') || 
                         btn.textContent.toLowerCase().includes('sign out')
                       );
  
  if (logoutButton) {
    results.logoutButtonFound = true;
    console.log('✅ Logout button found');
    
    // Check if button is clickable
    if (logoutButton.onclick || logoutButton.getAttribute('href')) {
      results.logoutButtonClickable = true;
      console.log('✅ Logout button is clickable');
    } else {
      console.error('❌ Logout button is not clickable');
    }
  } else {
    console.error('❌ Logout button not found');
  }
  
  const success = results.logoutButtonFound && results.logoutButtonClickable;
  console.log(`Logout button verification: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return { success, results };
}

// Verify role-specific components
function verifyRoleSpecificComponents() {
  console.log('Verifying role-specific components...');
  
  // Determine current role from URL
  const url = window.location.pathname;
  let role = 'unknown';
  
  if (url.includes('/admin')) {
    role = 'admin';
  } else if (url.includes('/doctor')) {
    role = 'doctor';
  } else if (url.includes('/secretary')) {
    role = 'secretary';
  }
  
  console.log(`Detected role: ${role}`);
  
  const results = {
    role,
    componentsFound: false
  };
  
  // Check for role-specific components
  switch (role) {
    case 'admin':
      // Check for user management and content management
      const userManagement = document.querySelector('.user-management') || 
                            document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('user');
      const contentManagement = document.querySelector('.content-management') || 
                               document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('content');
      
      results.componentsFound = userManagement || contentManagement;
      
      if (userManagement) {
        console.log('✅ User management component found');
      } else {
        console.error('❌ User management component not found');
      }
      
      if (contentManagement) {
        console.log('✅ Content management component found');
      } else {
        console.error('❌ Content management component not found');
      }
      break;
      
    case 'doctor':
      // Check for patient management, appointment management, and notes management
      const patientManagement = document.querySelector('.patient-management') || 
                               document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('patient');
      const appointmentManagement = document.querySelector('.appointment-management') || 
                                   document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('appointment');
      const notesManagement = document.querySelector('.notes-management') || 
                             document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('note');
      
      results.componentsFound = patientManagement || appointmentManagement || notesManagement;
      
      if (patientManagement) {
        console.log('✅ Patient management component found');
      } else {
        console.error('❌ Patient management component not found');
      }
      
      if (appointmentManagement) {
        console.log('✅ Appointment management component found');
      } else {
        console.error('❌ Appointment management component not found');
      }
      
      if (notesManagement) {
        console.log('✅ Notes management component found');
      } else {
        console.error('❌ Notes management component not found');
      }
      break;
      
    case 'secretary':
      // Check for patient management and appointment management
      const secPatientManagement = document.querySelector('.patient-management') || 
                                  document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('patient');
      const secAppointmentManagement = document.querySelector('.appointment-management') || 
                                      document.querySelector('h1, h2, h3').textContent.toLowerCase().includes('appointment');
      
      results.componentsFound = secPatientManagement || secAppointmentManagement;
      
      if (secPatientManagement) {
        console.log('✅ Patient management component found');
      } else {
        console.error('❌ Patient management component not found');
      }
      
      if (secAppointmentManagement) {
        console.log('✅ Appointment management component found');
      } else {
        console.error('❌ Appointment management component not found');
      }
      break;
      
    default:
      console.warn('⚠️ Unknown role, cannot verify role-specific components');
      break;
  }
  
  const success = results.componentsFound;
  console.log(`Role-specific components verification: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return { success, results };
}

// Run all verifications
function verifyAllComponents() {
  console.log('🔍 Starting dashboard component verification...');
  
  const layoutResult = verifyDashboardLayout();
  const navResult = verifyNavigationLinks();
  const userInfoResult = verifyUserInfo();
  const logoutResult = verifyLogoutButton();
  const roleComponentsResult = verifyRoleSpecificComponents();
  
  const overallSuccess = 
    layoutResult.success && 
    navResult.success && 
    userInfoResult.success && 
    logoutResult.success && 
    roleComponentsResult.success;
  
  console.log(`\n🏁 Overall verification: ${overallSuccess ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  return {
    success: overallSuccess,
    layout: layoutResult,
    navigation: navResult,
    userInfo: userInfoResult,
    logout: logoutResult,
    roleComponents: roleComponentsResult
  };
}

// Export functions for use in browser console
window.dashboardVerification = {
  verifyDashboardLayout,
  verifyNavigationLinks,
  verifyUserInfo,
  verifyLogoutButton,
  verifyRoleSpecificComponents,
  verifyAllComponents
};

console.log('Dashboard verification utilities loaded. Use window.dashboardVerification to access the verification functions.');
