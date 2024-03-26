import * as React from 'react';
import styles from './LeaveBalancesAndClaims.module.scss';
import { ILeaveBalancesAndClaimsProps } from './ILeaveBalancesAndClaimsProps';
//import { Client } from '@microsoft/microsoft-graph-client';

export interface ILeaveBalance {
  leaveDescription: string;
  availableBalance: string;
}

export interface IClaim {
  Personcode: string;
  EmployeeCode: string;
  Paycode: string;
  Reference: string;
  ClaimValue: string;
  ClaimType: string;
  ClaimDescription: string;
  ProcessType: string;
  ClaimDate: string;
  ProcessDate: string;
  PayStatus: string;
}

interface ILeaveBalancesAndClaimsState {
  leaveDescription: string;
  availableBalance: string;
  authenticateKey: string;
  outstandingClaims: string;
  totalClaimsValue: number;
}

export default class LeaveBalancesAndClaims extends React.Component<ILeaveBalancesAndClaimsProps, ILeaveBalancesAndClaimsState> {
  constructor(props: ILeaveBalancesAndClaimsProps) {
    super(props);
    this.state = {
      authenticateKey: "",
      leaveDescription: "",
      availableBalance: "",
      outstandingClaims: "",
      totalClaimsValue: 0, // INITIALIZE TOTAL CLAIMS VALUE TO 0
    };
  }

  // // INTEGRATING MICROSOFT GRAPH API FOR USER DETAILS
  // getGraphUserDetails = async () => {
  //   const graphEndpoint = "https://graph.microsoft.com/v1.0/me";

  //   try {
  //     const response = await fetch(graphEndpoint, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${this.state.authenticateKey}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const userData = await response.json();
  //       console.log('User Data:', userData);
  //       // Now you can extract the GID from the user data and set it in state
        
  //     } else {
  //       throw new Error('Error:' + response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  //}

  async componentDidMount(): Promise<void> {
    try {
      await this.authenticate();
      await this.fetchLeaveBalances();
      await this.fetchOutstandingClaims();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  fetchLeaveBalances = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const leaveBalancesEndpoint = `${baseURL}/collect/leavebal`;
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'vx-user-key': this.state.authenticateKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "params": "'10004240'"
      }),
    };

    try {
      const response = await fetch(leaveBalancesEndpoint, requestOptions);

      if (response.ok) {
        const leaveData = await response.json();

        if (leaveData) {
          const annualLeave = leaveData.find((item: any) => item.LeaveDescription === 'Annual');

          if (annualLeave) {
            this.setState({
              leaveDescription: annualLeave.LeaveDescription,
              availableBalance: annualLeave.AvailBal,
            });
          } else {
            console.error('Error: Annual leave data not found');
          }
        } else {
          console.error('Error: Invalid leave data');
        }
      } else {
        throw new Error('Error: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  fetchOutstandingClaims = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const claimsEndpoint = `${baseURL}/collect/claims/`;
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'vx-user-key': this.state.authenticateKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "params": "'10004240'"
      }),
    };

    try {
      const response = await fetch(claimsEndpoint, requestOptions);

      if (response.ok) {
        const claimsData: IClaim[] = await response.json();

        if (claimsData) {
          let totalValue = 0; // VARIABLE TO STORE TOTAL CLAIMS VALUE
          claimsData.forEach((claim: IClaim) => {
            if (claim.ProcessType === 'Paid with Salary') {
              totalValue += parseFloat(claim.ClaimValue); // ADD CLAIM VALUE TO TOTAL IF PROCESS TYPE IS 'Paid with Salary'
            }
          });
          this.setState({
            totalClaimsValue: totalValue, // SET TOTAL CLAIMS VALUE IN STATE
          });
        } else {
          console.error('Error: Invalid claim data');
        }
      } else {
        throw new Error('Error: ' + response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  authenticate = async (): Promise<void> => {
    const baseURL = `https://eohapi.educos.co.za`;
    const GID = "10004240";  // Updated GID value
    const authEndpoint = `${baseURL}/auth/${GID}`;
    const authUser = 'SharepAPI';
    const authKey = 'E6DA5F46B97C059E2E9200EAE71E23FE4FCC52888F96847B42DD65819FE536A1';

    try {
      const base64Auth = btoa(`${authUser}:${authKey}`);
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${base64Auth}`,
        },
      };
      const response = await fetch(authEndpoint, requestOptions);

      if (response.ok) {
        const data = await response.json();

        if (data) {
          const authKey = data.key;
          this.setState({
            authenticateKey: authKey,
          });
          console.log('authKey:', this.state.authenticateKey)
        } else {
          console.error('Error: invalid data');
        }
      } else {
        throw new Error('Error:' + response.statusText);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

  public render(): React.ReactElement<ILeaveBalancesAndClaimsProps> {
    const { hasTeamsContext } = this.props;
    const { availableBalance, totalClaimsValue } = this.state;
    const currencySymbol = totalClaimsValue !== 0 ? 'R' : ''; // Conditional rendering for currency symbol
  
    return (
      <section className={`${styles.leaveBalancesAndClaims} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.container}>
          <h2 className={styles.header}>Leave Balances and Claims</h2>
          <div className={styles.content}>
            {/* Leave Balances */}
            <div className={styles.info}>
              <div className={styles.totalClaims}>
                <strong>
                  <div className={styles.iconContainer}>
                    <img src="/sites/intranetx/SiteAssets/LeaveBal.png" alt="Icon" className={styles.icon} />
                    <span className={styles.leaveText}>
                      <a href="https://myess.eoh.co.za/" target="_blank" rel="noopener noreferrer">Annual Leave Days Available:</a>
                    </span>
                  </div>
                </strong>
                &nbsp;<span>{availableBalance}</span>
              </div>
            </div>
            
            {/* Claims Info */}
            <div className={styles.info}>
              {/* Conditional rendering for total claims value */}
              {totalClaimsValue !== 0 ? (
                <div className={styles.totalClaims}>
                  <strong>
                    <div className={styles.iconContainer}>
                      <img src="/sites/intranetx/SiteAssets/SalaryClaims.jpeg" alt="Icon" className={styles.icon} />
                      <span className={styles.leaveText}>
                        <a href="https://myess.eoh.co.za/" target="_blank" rel="noopener noreferrer">Total Claims Value:</a>
                      </span>
                    </div>
                  </strong>
                  &nbsp;<span>{currencySymbol}{totalClaimsValue.toFixed(2)}</span>&nbsp;(Paid with Salary)
                </div>
              ) : (
                <div className={styles.totalClaims}>
                  <strong>
                    <div className={styles.iconContainer}>
                      <img src="/sites/intranetx/SiteAssets/SalaryClaims.jpeg" alt="Icon" className={styles.icon} />
                      <span className={styles.leaveText}>
                        <a href="https://myess.eoh.co.za/" target="_blank" rel="noopener noreferrer">Total Claims Value:</a>
                      </span>
                    </div>
                  </strong>
                  &nbsp;<span>Zero</span>&nbsp;(Paid with Salary)
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}