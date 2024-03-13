import * as React from 'react';
import styles from './LeaveBalancesAndClaims.module.scss';
import { ILeaveBalancesAndClaimsProps } from './ILeaveBalancesAndClaimsProps';

export interface ILeaveBalance {
  leaveDescription: string;
  availableBalance: string;
}

interface ILeaveBalancesAndClaimsState {
  leaveDescription: string;
  availableBalance: string;
  authenticateKey: string;
}

export default class LeaveBalancesAndClaims extends React.Component<ILeaveBalancesAndClaimsProps, ILeaveBalancesAndClaimsState, ILeaveBalance> {
  constructor(props: ILeaveBalancesAndClaimsProps) {
    super(props);
    this.state = {
      authenticateKey: "",
      leaveDescription: "",
      availableBalance: ""
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      await this.authenticate();
      await this.fetchLeaveBalances();
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
      credentials: 'include',
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
    const {
      hasTeamsContext
    } = this.props;

    return (
      <section className={`${styles.leaveBalancesAndClaims} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.leaveBalancesAndClaims}>
          <h2 className={styles.header}>Leave Balances</h2>
          <div className={styles.leaveInfo}>
            {this.state.leaveDescription === 'Annual' && (
              <div className={styles.annualLeave}>
                <strong>Annual Leave Days Available:</strong> {this.state.availableBalance}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}